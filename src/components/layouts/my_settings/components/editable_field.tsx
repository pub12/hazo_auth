// file_description: reusable component for editable fields with pencil/edit/check/cancel icons
// section: client_directive
"use client";

// section: imports
import { useState } from "react";
import { Input } from "hazo_auth/components/ui/input";
import { Label } from "hazo_auth/components/ui/label";
import { Button } from "hazo_auth/components/ui/button";
import { Pencil, CheckCircle2, XCircle } from "lucide-react";

// section: types
export type EditableFieldProps = {
  label: string;
  value: string;
  type?: "text" | "email" | "tel" | "url";
  placeholder?: string;
  onSave: (value: string) => Promise<void>;
  onCancel?: () => void;
  validation?: (value: string) => string | null;
  disabled?: boolean;
  ariaLabel?: string;
};

// section: component
/**
 * Editable field component with pencil icon for edit mode
 * Shows check (green) and cancel (red) icons when in edit mode
 * @param props - Component props including label, value, onSave callback, etc.
 * @returns Editable field component
 */
export function EditableField({
  label,
  value,
  type = "text",
  placeholder,
  onSave,
  onCancel,
  validation,
  disabled = false,
  ariaLabel,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value);
    setError(null);
    onCancel?.();
  };

  const handleSave = async () => {
    // Validate if validation function provided
    if (validation) {
      const validationError = validation(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // Check if value changed
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="cls_editable_field flex flex-col gap-2">
      <Label htmlFor={`editable-field-${label}`} className="cls_editable_field_label text-sm font-medium text-slate-700">
        {label}
      </Label>
      <div className="cls_editable_field_input_container flex items-center gap-2">
        {isEditing ? (
          <>
            <Input
              id={`editable-field-${label}`}
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isSaving}
              aria-label={ariaLabel || label}
              className="cls_editable_field_input flex-1"
            />
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              variant="ghost"
              size="icon"
              className="cls_editable_field_save_button text-green-600 hover:text-green-700 hover:bg-green-50"
              aria-label="Save changes"
            >
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              variant="ghost"
              size="icon"
              className="cls_editable_field_cancel_button text-red-600 hover:text-red-700 hover:bg-red-50"
              aria-label="Cancel editing"
            >
              <XCircle className="h-5 w-5" aria-hidden="true" />
            </Button>
          </>
        ) : (
          <>
            <Input
              id={`editable-field-${label}`}
              type={type}
              value={value || ""}
              readOnly
              disabled
              placeholder={value ? undefined : placeholder || "Not set"}
              aria-label={ariaLabel || label}
              className="cls_editable_field_display flex-1 bg-slate-50 cursor-not-allowed"
            />
            {!disabled && (
              <Button
                type="button"
                onClick={handleEdit}
                variant="ghost"
                size="icon"
                className="cls_editable_field_edit_button text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                aria-label={`Edit ${label}`}
              >
                <Pencil className="h-5 w-5" aria-hidden="true" />
              </Button>
            )}
          </>
        )}
      </div>
      {error && (
        <p className="cls_editable_field_error text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

