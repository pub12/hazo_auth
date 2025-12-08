// file_description: Scope Labels tab component for configuring friendly names for scope levels
// section: client_directive
"use client";

// section: imports
import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider";

// section: types
export type ScopeLabelsTabProps = {
  className?: string;
  defaultOrg?: string;
};

type ScopeLevel = "hazo_scopes_l1" | "hazo_scopes_l2" | "hazo_scopes_l3" | "hazo_scopes_l4" | "hazo_scopes_l5" | "hazo_scopes_l6" | "hazo_scopes_l7";

const SCOPE_LEVELS: ScopeLevel[] = [
  "hazo_scopes_l1",
  "hazo_scopes_l2",
  "hazo_scopes_l3",
  "hazo_scopes_l4",
  "hazo_scopes_l5",
  "hazo_scopes_l6",
  "hazo_scopes_l7",
];

// section: component
/**
 * Scope Labels tab component for configuring friendly names for scope levels
 * Shows all 7 scope levels with their current labels from database
 * Empty inputs for levels without labels - no placeholders
 * @param props - Component props
 * @returns Scope Labels tab component
 */
export function ScopeLabelsTab({ className, defaultOrg = "" }: ScopeLabelsTabProps) {
  const { apiBasePath } = useHazoAuthConfig();

  // State - simple record of scope_type to label string (empty string if not set)
  const [labels, setLabels] = useState<Record<ScopeLevel, string>>(() => {
    const initial: Record<ScopeLevel, string> = {} as Record<ScopeLevel, string>;
    for (const level of SCOPE_LEVELS) {
      initial[level] = "";
    }
    return initial;
  });
  const [originalLabels, setOriginalLabels] = useState<Record<ScopeLevel, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [org, setOrg] = useState(defaultOrg);

  // Load labels from database (only real DB records, not synthetic defaults)
  const loadLabels = useCallback(async () => {
    if (!org.trim()) {
      // Reset to empty if no org
      const empty: Record<ScopeLevel, string> = {} as Record<ScopeLevel, string>;
      for (const level of SCOPE_LEVELS) {
        empty[level] = "";
      }
      setLabels(empty);
      setOriginalLabels(empty);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch WITHOUT defaults - only get actual DB records
      const params = new URLSearchParams({ org: org.trim(), include_defaults: "false" });
      const response = await fetch(`${apiBasePath}/scope_management/labels?${params}`);
      const data = await response.json();

      if (data.success) {
        // Start with empty labels
        const newLabels: Record<ScopeLevel, string> = {} as Record<ScopeLevel, string>;
        for (const level of SCOPE_LEVELS) {
          newLabels[level] = "";
        }

        // Fill in labels from database
        const dbLabels = data.labels || [];
        for (const dbLabel of dbLabels) {
          if (dbLabel.scope_type && dbLabel.label) {
            newLabels[dbLabel.scope_type as ScopeLevel] = dbLabel.label;
          }
        }

        setLabels(newLabels);
        setOriginalLabels({ ...newLabels });
      } else {
        toast.error(data.error || "Failed to load labels");
      }
    } catch {
      toast.error("Failed to load labels");
    } finally {
      setLoading(false);
    }
  }, [apiBasePath, org]);

  // Load labels when org changes
  useEffect(() => {
    void loadLabels();
  }, [loadLabels]);

  // Handle label change
  const handleLabelChange = (level: ScopeLevel, value: string) => {
    setLabels((prev) => ({
      ...prev,
      [level]: value,
    }));
  };

  // Check if there are unsaved changes
  const hasChanges = (): boolean => {
    if (!originalLabels) return false;
    for (const level of SCOPE_LEVELS) {
      if (labels[level] !== originalLabels[level]) {
        return true;
      }
    }
    return false;
  };

  // Save all labels - send all non-empty labels to be upserted
  const handleSave = async () => {
    if (!org.trim()) {
      toast.error("Organization is required");
      return;
    }

    // Collect all non-empty labels
    const labelsToSave: Array<{ scope_type: ScopeLevel; label: string }> = [];
    for (const level of SCOPE_LEVELS) {
      const label = labels[level].trim();
      if (label) {
        labelsToSave.push({
          scope_type: level,
          label: label,
        });
      }
    }

    setSaving(true);
    try {
      const response = await fetch(`${apiBasePath}/scope_management/labels`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org: org.trim(),
          labels: labelsToSave,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Labels saved successfully");
        // Reload to get fresh state
        await loadLabels();
      } else {
        toast.error(data.error || "Failed to save labels");
      }
    } catch {
      toast.error("Failed to save labels");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`cls_scope_labels_tab flex flex-col gap-4 w-full ${className || ""}`}>
      {/* Header with org input and save button */}
      <div className="cls_scope_labels_header flex items-center justify-between gap-4 flex-wrap">
        <div className="cls_scope_labels_header_left flex items-center gap-4">
          <div className="cls_scope_labels_org_input flex items-center gap-2">
            <Label htmlFor="labels_org" className="text-sm font-medium">
              Organization:
            </Label>
            <Input
              id="labels_org"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="Enter organization name"
              className="w-[200px]"
            />
          </div>
        </div>

        <div className="cls_scope_labels_header_right">
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges() || !org.trim()}
            variant="default"
            size="sm"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Labels table */}
      {loading ? (
        <div className="cls_scope_labels_loading flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="cls_scope_labels_table_container border rounded-lg overflow-auto w-full">
          <Table className="cls_scope_labels_table w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Scope Level</TableHead>
                <TableHead>Label</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SCOPE_LEVELS.map((level) => {
                const label = labels[level];

                return (
                  <TableRow key={level}>
                    <TableCell className="font-mono text-sm">{level}</TableCell>
                    <TableCell>
                      <Input
                        value={label}
                        onChange={(e) => handleLabelChange(level, e.target.value)}
                        className="max-w-[400px]"
                        disabled={!org.trim()}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Info message */}
      {!org.trim() && (
        <div className="cls_scope_labels_info text-sm text-muted-foreground text-center p-4 bg-muted/50 rounded-lg">
          Enter an organization name to customize scope labels.
        </div>
      )}
    </div>
  );
}
