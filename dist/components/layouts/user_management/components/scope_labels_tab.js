// file_description: Scope Labels tab component for configuring friendly names for scope levels
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// section: imports
import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "../../../ui/table";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider";
const SCOPE_LEVELS = [
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
export function ScopeLabelsTab({ className, defaultOrg = "" }) {
    const { apiBasePath } = useHazoAuthConfig();
    // State - simple record of scope_type to label string (empty string if not set)
    const [labels, setLabels] = useState(() => {
        const initial = {};
        for (const level of SCOPE_LEVELS) {
            initial[level] = "";
        }
        return initial;
    });
    const [originalLabels, setOriginalLabels] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [org, setOrg] = useState(defaultOrg);
    // Load labels from database (only real DB records, not synthetic defaults)
    const loadLabels = useCallback(async () => {
        if (!org.trim()) {
            // Reset to empty if no org
            const empty = {};
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
                const newLabels = {};
                for (const level of SCOPE_LEVELS) {
                    newLabels[level] = "";
                }
                // Fill in labels from database
                const dbLabels = data.labels || [];
                for (const dbLabel of dbLabels) {
                    if (dbLabel.scope_type && dbLabel.label) {
                        newLabels[dbLabel.scope_type] = dbLabel.label;
                    }
                }
                setLabels(newLabels);
                setOriginalLabels(Object.assign({}, newLabels));
            }
            else {
                toast.error(data.error || "Failed to load labels");
            }
        }
        catch (_a) {
            toast.error("Failed to load labels");
        }
        finally {
            setLoading(false);
        }
    }, [apiBasePath, org]);
    // Load labels when org changes
    useEffect(() => {
        void loadLabels();
    }, [loadLabels]);
    // Handle label change
    const handleLabelChange = (level, value) => {
        setLabels((prev) => (Object.assign(Object.assign({}, prev), { [level]: value })));
    };
    // Check if there are unsaved changes
    const hasChanges = () => {
        if (!originalLabels)
            return false;
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
        const labelsToSave = [];
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
            }
            else {
                toast.error(data.error || "Failed to save labels");
            }
        }
        catch (_a) {
            toast.error("Failed to save labels");
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: `cls_scope_labels_tab flex flex-col gap-4 w-full ${className || ""}`, children: [_jsxs("div", { className: "cls_scope_labels_header flex items-center justify-between gap-4 flex-wrap", children: [_jsx("div", { className: "cls_scope_labels_header_left flex items-center gap-4", children: _jsxs("div", { className: "cls_scope_labels_org_input flex items-center gap-2", children: [_jsx(Label, { htmlFor: "labels_org", className: "text-sm font-medium", children: "Organization:" }), _jsx(Input, { id: "labels_org", value: org, onChange: (e) => setOrg(e.target.value), placeholder: "Enter organization name", className: "w-[200px]" })] }) }), _jsx("div", { className: "cls_scope_labels_header_right", children: _jsx(Button, { onClick: handleSave, disabled: saving || !hasChanges() || !org.trim(), variant: "default", size: "sm", children: saving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Saving..."] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save Changes"] })) }) })] }), loading ? (_jsx("div", { className: "cls_scope_labels_loading flex items-center justify-center p-8", children: _jsx(Loader2, { className: "h-6 w-6 animate-spin text-slate-400" }) })) : (_jsx("div", { className: "cls_scope_labels_table_container border rounded-lg overflow-auto w-full", children: _jsxs(Table, { className: "cls_scope_labels_table w-full", children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "w-[180px]", children: "Scope Level" }), _jsx(TableHead, { children: "Label" })] }) }), _jsx(TableBody, { children: SCOPE_LEVELS.map((level) => {
                                const label = labels[level];
                                return (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-mono text-sm", children: level }), _jsx(TableCell, { children: _jsx(Input, { value: label, onChange: (e) => handleLabelChange(level, e.target.value), className: "max-w-[400px]", disabled: !org.trim() }) })] }, level));
                            }) })] }) })), !org.trim() && (_jsx("div", { className: "cls_scope_labels_info text-sm text-muted-foreground text-center p-4 bg-muted/50 rounded-lg", children: "Enter an organization name to customize scope labels." }))] }));
}
