// file_description: Schema-based editor for app_user_data in User Management
// Renders form fields based on JSON schema from config
// section: client_directive
"use client";

// section: imports
import { useState, useEffect, useCallback } from "react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Switch } from "../../../ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog";
import { ChevronDown, ChevronRight, Edit, Loader2, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider";

// section: types

type SchemaProperty = {
  type: "string" | "number" | "boolean" | "object";
  properties?: Record<string, SchemaProperty>;
};

type AppUserDataSchema = {
  type: "object";
  properties: Record<string, SchemaProperty>;
};

type SchemaResponse = {
  success: boolean;
  enabled: boolean;
  schema: AppUserDataSchema | null;
  section_labels: Record<string, string>;
  field_labels: Record<string, Record<string, string>>;
};

export type AppUserDataEditorProps = {
  /** User ID to edit */
  userId: string;
  /** Current app_user_data value */
  currentData: Record<string, unknown> | null;
  /** Callback when data is saved */
  onSave?: (newData: Record<string, unknown>) => void;
  /** Callback when data is cleared */
  onClear?: () => void;
  /** Whether the editor is read-only (no edit button) */
  readOnly?: boolean;
};

// section: helpers

/**
 * Get nested value from object using dot-notation path
 */
function getNestedValue(obj: Record<string, unknown> | null, path: string[]): unknown {
  if (!obj) return undefined;
  let current: unknown = obj;
  for (const key of path) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/**
 * Set nested value in object using dot-notation path
 */
function setNestedValue(
  obj: Record<string, unknown>,
  path: string[],
  value: unknown
): Record<string, unknown> {
  const result = { ...obj };
  let current = result;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {};
    } else {
      current[key] = { ...(current[key] as Record<string, unknown>) };
    }
    current = current[key] as Record<string, unknown>;
  }

  const lastKey = path[path.length - 1];
  current[lastKey] = value;

  return result;
}

// section: component

export function AppUserDataEditor({
  userId,
  currentData,
  onSave,
  onClear,
  readOnly = false,
}: AppUserDataEditorProps) {
  const { apiBasePath } = useHazoAuthConfig();
  const [schemaResponse, setSchemaResponse] = useState<SchemaResponse | null>(null);
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Load schema on mount
  useEffect(() => {
    const loadSchema = async () => {
      try {
        const response = await fetch(`${apiBasePath}/app_user_data/schema`);
        const data = await response.json();
        if (data.success) {
          setSchemaResponse(data);
          // Expand all sections by default
          if (data.schema?.properties) {
            setExpandedSections(new Set(Object.keys(data.schema.properties)));
          }
        }
      } catch (error) {
        console.error("Failed to load schema:", error);
      } finally {
        setSchemaLoading(false);
      }
    };

    void loadSchema();
  }, [apiBasePath]);

  // Start editing
  const handleEdit = useCallback(() => {
    setEditData(currentData ? JSON.parse(JSON.stringify(currentData)) : {});
    setIsEditing(true);
  }, [currentData]);

  // Cancel editing
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditData({});
  }, []);

  // Save changes - uses user_management/users PATCH endpoint for admin editing
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const response = await fetch(`${apiBasePath}/user_management/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          app_user_data: editData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("App user data saved");
        setIsEditing(false);
        onSave?.(editData);
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch (error) {
      toast.error("Failed to save app user data");
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  }, [apiBasePath, userId, editData, onSave]);

  // Clear app_user_data - uses user_management/users PATCH endpoint with null
  const handleClear = useCallback(async () => {
    setClearing(true);
    try {
      const response = await fetch(`${apiBasePath}/user_management/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          app_user_data: null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("App user data cleared");
        setShowClearConfirmation(false);
        onClear?.();
      } else {
        toast.error(data.error || "Failed to clear");
      }
    } catch (error) {
      toast.error("Failed to clear app user data");
      console.error("Clear error:", error);
    } finally {
      setClearing(false);
    }
  }, [apiBasePath, userId, onClear]);

  // Update field value
  const updateField = useCallback((path: string[], value: unknown) => {
    setEditData((prev) => setNestedValue(prev, path, value));
  }, []);

  // Toggle section expansion
  const toggleSection = useCallback((sectionKey: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionKey)) {
        next.delete(sectionKey);
      } else {
        next.add(sectionKey);
      }
      return next;
    });
  }, []);

  // Render a single field
  const renderField = (
    fieldKey: string,
    fieldSchema: SchemaProperty,
    path: string[],
    sectionKey: string
  ) => {
    const fullPath = [...path, fieldKey];
    const currentValue = isEditing
      ? getNestedValue(editData, fullPath)
      : getNestedValue(currentData, fullPath);

    const label =
      schemaResponse?.field_labels?.[sectionKey]?.[fieldKey] ||
      fieldKey
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    if (isEditing) {
      // Edit mode - render input fields
      switch (fieldSchema.type) {
        case "boolean":
          return (
            <div key={fieldKey} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded">
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <Switch
                checked={currentValue === true}
                onCheckedChange={(checked) => updateField(fullPath, checked)}
              />
            </div>
          );
        case "number":
          return (
            <div key={fieldKey} className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</Label>
              <Input
                type="number"
                value={currentValue !== undefined ? String(currentValue) : ""}
                onChange={(e) =>
                  updateField(fullPath, e.target.value ? Number(e.target.value) : undefined)
                }
                className="h-9"
              />
            </div>
          );
        case "string":
        default:
          return (
            <div key={fieldKey} className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</Label>
              <Input
                type="text"
                value={typeof currentValue === "string" ? currentValue : ""}
                onChange={(e) => updateField(fullPath, e.target.value || undefined)}
                className="h-9"
              />
            </div>
          );
      }
    } else {
      // View mode - display values with styled container
      let displayValue: string;
      if (currentValue === undefined || currentValue === null) {
        displayValue = "-";
      } else if (typeof currentValue === "boolean") {
        displayValue = currentValue ? "Yes" : "No";
      } else {
        displayValue = String(currentValue);
      }

      return (
        <div key={fieldKey} className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
          <span className="text-sm font-medium bg-muted/30 px-3 py-2 rounded">{displayValue}</span>
        </div>
      );
    }
  };

  // Render a section (top-level object property)
  const renderSection = (sectionKey: string, sectionSchema: SchemaProperty) => {
    if (sectionSchema.type !== "object" || !sectionSchema.properties) {
      return null;
    }

    const sectionLabel =
      schemaResponse?.section_labels?.[sectionKey] ||
      sectionKey
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    const isExpanded = expandedSections.has(sectionKey);

    return (
      <div key={sectionKey} className="border rounded-lg bg-card shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection(sectionKey)}
          className="flex w-full items-center justify-between p-4 hover:bg-muted/50 rounded-t-lg text-left transition-colors"
        >
          <span className="font-medium">{sectionLabel}</span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {isExpanded && (
          <div className="px-4 pb-4 border-t">
            <div className="grid grid-cols-2 gap-4 pt-4">
              {Object.entries(sectionSchema.properties).map(([fieldKey, fieldSchema]) =>
                renderField(fieldKey, fieldSchema, [sectionKey], sectionKey)
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (schemaLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Schema not enabled - show raw data
  if (!schemaResponse?.enabled || !schemaResponse?.schema) {
    return (
      <div className="text-sm">
        {currentData && Object.keys(currentData).length > 0 ? (
          <pre className="border rounded-lg p-2 bg-slate-50 overflow-x-auto text-xs">
            {JSON.stringify(currentData, null, 2)}
          </pre>
        ) : (
          <span className="text-muted-foreground">No app user data</span>
        )}
      </div>
    );
  }

  // Render schema-based editor
  return (
    <div className="flex flex-col gap-4">
      {/* Header with title and Edit/Clear buttons */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          App User Data
        </h3>
        {!readOnly && !isEditing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="h-8"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
            {currentData && Object.keys(currentData).length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearConfirmation(true)}
                className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-3">
        {Object.entries(schemaResponse.schema.properties).map(
          ([sectionKey, sectionSchema]) => renderSection(sectionKey, sectionSchema)
        )}
      </div>

      {/* Save/Cancel buttons in edit mode */}
      {isEditing && (
        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={saving}
            className="h-9"
          >
            <X className="h-4 w-4 mr-1.5" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-9"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            Save
          </Button>
        </div>
      )}

      {/* Clear confirmation dialog */}
      <AlertDialog open={showClearConfirmation} onOpenChange={setShowClearConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear App User Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all app user data for this user. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClear}
              disabled={clearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {clearing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Clearing...
                </>
              ) : (
                "Clear Data"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
