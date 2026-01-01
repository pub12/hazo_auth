// file_description: Schema-based editor for app_user_data in User Management
// Renders form fields based on JSON schema from config
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// section: imports
import { useState, useEffect, useCallback } from "react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Switch } from "../../../ui/switch";
import { ChevronDown, ChevronRight, Edit, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider";
// section: helpers
/**
 * Get nested value from object using dot-notation path
 */
function getNestedValue(obj, path) {
    if (!obj)
        return undefined;
    let current = obj;
    for (const key of path) {
        if (current === null || current === undefined || typeof current !== "object") {
            return undefined;
        }
        current = current[key];
    }
    return current;
}
/**
 * Set nested value in object using dot-notation path
 */
function setNestedValue(obj, path, value) {
    const result = Object.assign({}, obj);
    let current = result;
    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (!current[key] || typeof current[key] !== "object") {
            current[key] = {};
        }
        else {
            current[key] = Object.assign({}, current[key]);
        }
        current = current[key];
    }
    const lastKey = path[path.length - 1];
    current[lastKey] = value;
    return result;
}
// section: component
export function AppUserDataEditor({ userId, currentData, onSave, readOnly = false, }) {
    const { apiBasePath } = useHazoAuthConfig();
    const [schemaResponse, setSchemaResponse] = useState(null);
    const [schemaLoading, setSchemaLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [expandedSections, setExpandedSections] = useState(new Set());
    // Load schema on mount
    useEffect(() => {
        const loadSchema = async () => {
            var _a;
            try {
                const response = await fetch(`${apiBasePath}/app_user_data/schema`);
                const data = await response.json();
                if (data.success) {
                    setSchemaResponse(data);
                    // Expand all sections by default
                    if ((_a = data.schema) === null || _a === void 0 ? void 0 : _a.properties) {
                        setExpandedSections(new Set(Object.keys(data.schema.properties)));
                    }
                }
            }
            catch (error) {
                console.error("Failed to load schema:", error);
            }
            finally {
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
                onSave === null || onSave === void 0 ? void 0 : onSave(editData);
            }
            else {
                toast.error(data.error || "Failed to save");
            }
        }
        catch (error) {
            toast.error("Failed to save app user data");
            console.error("Save error:", error);
        }
        finally {
            setSaving(false);
        }
    }, [apiBasePath, userId, editData, onSave]);
    // Update field value
    const updateField = useCallback((path, value) => {
        setEditData((prev) => setNestedValue(prev, path, value));
    }, []);
    // Toggle section expansion
    const toggleSection = useCallback((sectionKey) => {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            if (next.has(sectionKey)) {
                next.delete(sectionKey);
            }
            else {
                next.add(sectionKey);
            }
            return next;
        });
    }, []);
    // Render a single field
    const renderField = (fieldKey, fieldSchema, path, sectionKey) => {
        var _a, _b;
        const fullPath = [...path, fieldKey];
        const currentValue = isEditing
            ? getNestedValue(editData, fullPath)
            : getNestedValue(currentData, fullPath);
        const label = ((_b = (_a = schemaResponse === null || schemaResponse === void 0 ? void 0 : schemaResponse.field_labels) === null || _a === void 0 ? void 0 : _a[sectionKey]) === null || _b === void 0 ? void 0 : _b[fieldKey]) ||
            fieldKey
                .split("_")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
        if (isEditing) {
            // Edit mode - render input fields
            switch (fieldSchema.type) {
                case "boolean":
                    return (_jsxs("div", { className: "flex items-center justify-between py-2 px-3 bg-muted/30 rounded", children: [_jsx(Label, { className: "text-xs text-muted-foreground", children: label }), _jsx(Switch, { checked: currentValue === true, onCheckedChange: (checked) => updateField(fullPath, checked) })] }, fieldKey));
                case "number":
                    return (_jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx(Label, { className: "text-xs text-muted-foreground uppercase tracking-wide", children: label }), _jsx(Input, { type: "number", value: currentValue !== undefined ? String(currentValue) : "", onChange: (e) => updateField(fullPath, e.target.value ? Number(e.target.value) : undefined), className: "h-9" })] }, fieldKey));
                case "string":
                default:
                    return (_jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx(Label, { className: "text-xs text-muted-foreground uppercase tracking-wide", children: label }), _jsx(Input, { type: "text", value: typeof currentValue === "string" ? currentValue : "", onChange: (e) => updateField(fullPath, e.target.value || undefined), className: "h-9" })] }, fieldKey));
            }
        }
        else {
            // View mode - display values with styled container
            let displayValue;
            if (currentValue === undefined || currentValue === null) {
                displayValue = "-";
            }
            else if (typeof currentValue === "boolean") {
                displayValue = currentValue ? "Yes" : "No";
            }
            else {
                displayValue = String(currentValue);
            }
            return (_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: label }), _jsx("span", { className: "text-sm font-medium bg-muted/30 px-3 py-2 rounded", children: displayValue })] }, fieldKey));
        }
    };
    // Render a section (top-level object property)
    const renderSection = (sectionKey, sectionSchema) => {
        var _a;
        if (sectionSchema.type !== "object" || !sectionSchema.properties) {
            return null;
        }
        const sectionLabel = ((_a = schemaResponse === null || schemaResponse === void 0 ? void 0 : schemaResponse.section_labels) === null || _a === void 0 ? void 0 : _a[sectionKey]) ||
            sectionKey
                .split("_")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
        const isExpanded = expandedSections.has(sectionKey);
        return (_jsxs("div", { className: "border rounded-lg bg-card shadow-sm", children: [_jsxs("button", { type: "button", onClick: () => toggleSection(sectionKey), className: "flex w-full items-center justify-between p-4 hover:bg-muted/50 rounded-t-lg text-left transition-colors", children: [_jsx("span", { className: "font-medium", children: sectionLabel }), isExpanded ? (_jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" })) : (_jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground" }))] }), isExpanded && (_jsx("div", { className: "px-4 pb-4 border-t", children: _jsx("div", { className: "grid grid-cols-2 gap-4 pt-4", children: Object.entries(sectionSchema.properties).map(([fieldKey, fieldSchema]) => renderField(fieldKey, fieldSchema, [sectionKey], sectionKey)) }) }))] }, sectionKey));
    };
    // Loading state
    if (schemaLoading) {
        return (_jsx("div", { className: "flex items-center justify-center py-4", children: _jsx(Loader2, { className: "h-4 w-4 animate-spin text-muted-foreground" }) }));
    }
    // Schema not enabled - show raw data
    if (!(schemaResponse === null || schemaResponse === void 0 ? void 0 : schemaResponse.enabled) || !(schemaResponse === null || schemaResponse === void 0 ? void 0 : schemaResponse.schema)) {
        return (_jsx("div", { className: "text-sm", children: currentData && Object.keys(currentData).length > 0 ? (_jsx("pre", { className: "border rounded-lg p-2 bg-slate-50 overflow-x-auto text-xs", children: JSON.stringify(currentData, null, 2) })) : (_jsx("span", { className: "text-muted-foreground", children: "No app user data" })) }));
    }
    // Render schema-based editor
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-sm font-semibold uppercase tracking-wide text-muted-foreground", children: "App User Data" }), !readOnly && !isEditing && (_jsxs(Button, { variant: "outline", size: "sm", onClick: handleEdit, className: "h-8", children: [_jsx(Edit, { className: "h-3.5 w-3.5 mr-1.5" }), "Edit"] }))] }), _jsx("div", { className: "flex flex-col gap-3", children: Object.entries(schemaResponse.schema.properties).map(([sectionKey, sectionSchema]) => renderSection(sectionKey, sectionSchema)) }), isEditing && (_jsxs("div", { className: "flex justify-end gap-2 pt-3 border-t", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: handleCancel, disabled: saving, className: "h-9", children: [_jsx(X, { className: "h-4 w-4 mr-1.5" }), "Cancel"] }), _jsxs(Button, { size: "sm", onClick: handleSave, disabled: saving, className: "h-9", children: [saving ? (_jsx(Loader2, { className: "h-4 w-4 mr-1.5 animate-spin" })) : (_jsx(Save, { className: "h-4 w-4 mr-1.5" })), "Save"] })] }))] }));
}
