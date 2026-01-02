// file_description: reusable component for editable fields with pencil/edit/check/cancel icons
// section: client_directive
"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// section: imports
import { useState } from "react";
import { Input } from "../../../ui/input.js";
import { Label } from "../../../ui/label.js";
import { Button } from "../../../ui/button.js";
import { Pencil, CheckCircle2, XCircle } from "lucide-react";
// section: component
/**
 * Editable field component with pencil icon for edit mode
 * Shows check (green) and cancel (red) icons when in edit mode
 * @param props - Component props including label, value, onSave callback, etc.
 * @returns Editable field component
 */
export function EditableField({ label, value, type = "text", placeholder, onSave, onCancel, validation, disabled = false, ariaLabel, }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const handleEdit = () => {
        if (disabled)
            return;
        setIsEditing(true);
        setEditValue(value);
        setError(null);
    };
    const handleCancel = () => {
        setIsEditing(false);
        setEditValue(value);
        setError(null);
        onCancel === null || onCancel === void 0 ? void 0 : onCancel();
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to save";
            setError(errorMessage);
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            void handleSave();
        }
        else if (e.key === "Escape") {
            handleCancel();
        }
    };
    return (_jsxs("div", { className: "cls_editable_field flex flex-col gap-2", children: [_jsx(Label, { htmlFor: `editable-field-${label}`, className: "cls_editable_field_label text-sm font-medium text-[var(--hazo-text-secondary)]", children: label }), _jsx("div", { className: "cls_editable_field_input_container flex items-center gap-2", children: isEditing ? (_jsxs(_Fragment, { children: [_jsx(Input, { id: `editable-field-${label}`, type: type, value: editValue, onChange: (e) => setEditValue(e.target.value), onKeyDown: handleKeyDown, placeholder: placeholder, disabled: isSaving, "aria-label": ariaLabel || label, className: "cls_editable_field_input flex-1" }), _jsx(Button, { type: "button", onClick: handleSave, disabled: isSaving, variant: "ghost", size: "icon", className: "cls_editable_field_save_button text-green-600 hover:text-green-700 hover:bg-green-50", "aria-label": "Save changes", children: _jsx(CheckCircle2, { className: "h-5 w-5", "aria-hidden": "true" }) }), _jsx(Button, { type: "button", onClick: handleCancel, disabled: isSaving, variant: "ghost", size: "icon", className: "cls_editable_field_cancel_button text-red-600 hover:text-red-700 hover:bg-red-50", "aria-label": "Cancel editing", children: _jsx(XCircle, { className: "h-5 w-5", "aria-hidden": "true" }) })] })) : (_jsxs(_Fragment, { children: [_jsx(Input, { id: `editable-field-${label}`, type: type, value: value || "", readOnly: true, disabled: true, placeholder: value ? undefined : placeholder || "Not set", "aria-label": ariaLabel || label, className: "cls_editable_field_display flex-1 bg-[var(--hazo-bg-subtle)] cursor-not-allowed" }), !disabled && (_jsx(Button, { type: "button", onClick: handleEdit, variant: "ghost", size: "icon", className: "cls_editable_field_edit_button text-[var(--hazo-text-muted)] hover:text-[var(--hazo-text-secondary)] hover:bg-[var(--hazo-bg-subtle)]", "aria-label": `Edit ${label}`, children: _jsx(Pencil, { className: "h-5 w-5", "aria-hidden": "true" }) }))] })) }), error && (_jsx("p", { className: "cls_editable_field_error text-sm text-red-600", role: "alert", children: error }))] }));
}
