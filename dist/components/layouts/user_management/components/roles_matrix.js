// file_description: internal reusable component for roles-permissions matrix with data table
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// section: imports
import { useState, useEffect } from "react";
import { Button } from "../../../ui/button";
import { Checkbox } from "../../../ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "../../../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Plus, Loader2, CircleCheck, CircleX } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "../../../ui/avatar";
// section: component
/**
 * Roles matrix component - reusable internal component for roles-permissions matrix
 * Shows data table with permissions as columns and roles as rows
 * Checkboxes in cells indicate role-permission mappings
 * Changes are stored locally and only saved when Save button is pressed
 * @param props - Component props including button enable flags and save callback
 * @returns Roles matrix component
 */
export function RolesMatrix({ add_button_enabled = true, role_name_selection_enabled = true, permissions_read_only = false, show_save_cancel = true, user_id, onSave, onCancel, onRoleSelection, className, }) {
    const [roles, setRoles] = useState([]);
    const [originalRoles, setOriginalRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [userInfo, setUserInfo] = useState(null);
    const [userRoleIds, setUserRoleIds] = useState([]);
    // Load roles and permissions on mount
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Load roles and permissions
                const roles_response = await fetch("/api/hazo_auth/user_management/roles");
                const roles_data = await roles_response.json();
                if (!roles_data.success) {
                    toast.error("Failed to load roles and permissions");
                    setLoading(false);
                    return;
                }
                setPermissions(roles_data.permissions.map((p) => p.permission_name));
                // Initialize roles with permissions as Sets
                const roles_with_permissions = roles_data.roles.map((role) => ({
                    role_id: role.role_id,
                    role_name: role.role_name,
                    selected: false,
                    permissions: new Set(role.permissions),
                }));
                // Store original state for cancel functionality
                const original_roles = roles_data.roles.map((role) => ({
                    role_id: role.role_id,
                    role_name: role.role_name,
                    selected: false,
                    permissions: new Set(role.permissions),
                }));
                // If user_id is provided, load user info and user roles
                if (user_id) {
                    // Load user info
                    const user_response = await fetch(`/api/hazo_auth/user_management/users?id=${user_id}`);
                    const user_data = await user_response.json();
                    if (user_data.success && Array.isArray(user_data.users) && user_data.users.length > 0) {
                        const user = user_data.users[0];
                        setUserInfo({
                            name: user.name || null,
                            email_address: user.email_address,
                            profile_picture_url: user.profile_picture_url || null,
                        });
                    }
                    // Load user roles
                    const user_roles_response = await fetch(`/api/hazo_auth/user_management/users/roles?user_id=${user_id}`);
                    const user_roles_data = await user_roles_response.json();
                    if (user_roles_data.success && Array.isArray(user_roles_data.role_ids)) {
                        setUserRoleIds(user_roles_data.role_ids);
                        // Pre-check roles that are assigned to the user
                        roles_with_permissions.forEach((role) => {
                            if (role.role_id !== undefined && user_roles_data.role_ids.includes(role.role_id)) {
                                role.selected = true;
                            }
                        });
                        // Also update original roles
                        original_roles.forEach((role) => {
                            if (role.role_id !== undefined && user_roles_data.role_ids.includes(role.role_id)) {
                                role.selected = true;
                            }
                        });
                    }
                }
                setRoles(roles_with_permissions);
                setOriginalRoles(original_roles);
            }
            catch (error) {
                toast.error("Failed to load roles and permissions");
            }
            finally {
                setLoading(false);
            }
        };
        void loadData();
    }, [user_id]);
    // Handle checkbox change for role-permission mapping
    const handlePermissionToggle = (role_index, permission_name) => {
        setRoles((prev) => {
            const updated = [...prev];
            const role = Object.assign({}, updated[role_index]);
            const new_permissions = new Set(role.permissions);
            if (new_permissions.has(permission_name)) {
                new_permissions.delete(permission_name);
            }
            else {
                new_permissions.add(permission_name);
            }
            role.permissions = new_permissions;
            updated[role_index] = role;
            return updated;
        });
    };
    // Handle role name checkbox toggle
    const handleRoleSelectionToggle = (role_index) => {
        // Toggle selection state
        setRoles((prev) => {
            const updated = [...prev];
            const updated_role = Object.assign({}, updated[role_index]);
            updated_role.selected = !updated_role.selected;
            updated[role_index] = updated_role;
            return updated;
        });
    };
    // Handle add role
    const handleAddRole = () => {
        if (!newRoleName.trim()) {
            toast.error("Role name is required");
            return;
        }
        // Check if role name already exists
        if (roles.some((r) => r.role_name.toLowerCase() === newRoleName.trim().toLowerCase())) {
            toast.error("Role with this name already exists");
            return;
        }
        setRoles((prev) => [
            ...prev,
            {
                role_name: newRoleName.trim(),
                selected: false,
                permissions: new Set(),
            },
        ]);
        setNewRoleName("");
        setIsAddDialogOpen(false);
        toast.success("Role added. Don't forget to save changes.");
    };
    // Handle cancel - reset to original database state
    const handleCancel = () => {
        // Deep clone original roles to reset state (this removes any newly added roles without role_id)
        const reset_roles = originalRoles.map((role) => ({
            role_id: role.role_id,
            role_name: role.role_name,
            selected: role.selected,
            permissions: new Set(role.permissions),
        }));
        setRoles(reset_roles);
        toast.info("Changes cancelled. State reset to database values.");
        // Call onCancel callback if provided (e.g., to close dialog)
        if (onCancel) {
            onCancel();
        }
    };
    // Handle save
    const handleSave = async () => {
        setSaving(true);
        try {
            // Convert Sets to arrays for JSON serialization
            const roles_data = {
                roles: roles.map((role) => ({
                    role_id: role.role_id,
                    role_name: role.role_name,
                    selected: role.selected,
                    permissions: Array.from(role.permissions),
                })),
            };
            // If user_id is provided, save user roles instead of role-permission mappings
            if (user_id) {
                // Get selected role IDs
                const selected_role_ids = roles
                    .filter((role) => role.selected && role.role_id !== undefined)
                    .map((role) => role.role_id);
                // Update user roles via API
                const response = await fetch("/api/hazo_auth/user_management/users/roles", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user_id,
                        role_ids: selected_role_ids,
                    }),
                });
                const data = await response.json();
                if (data.success) {
                    toast.success("User roles updated successfully");
                    // Update original state to reflect saved changes
                    const updated_original_roles = originalRoles.map((role) => (Object.assign(Object.assign({}, role), { selected: role.role_id !== undefined && selected_role_ids.includes(role.role_id) })));
                    setOriginalRoles(updated_original_roles);
                    setUserRoleIds(selected_role_ids);
                }
                else {
                    toast.error(data.error || "Failed to update user roles");
                }
            }
            else {
                // Save role-permission mappings (original behavior)
                // Call onSave callback if provided
                if (onSave) {
                    onSave(roles_data);
                }
                // Save to API
                const response = await fetch("/api/hazo_auth/user_management/roles", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(roles_data),
                });
                const data = await response.json();
                if (data.success) {
                    toast.success("Roles and permissions saved successfully");
                    // Reload data to get updated role IDs
                    const reload_response = await fetch("/api/hazo_auth/user_management/roles");
                    const reload_data = await reload_response.json();
                    if (reload_data.success) {
                        const updated_roles = reload_data.roles.map((role) => ({
                            role_id: role.role_id,
                            role_name: role.role_name,
                            selected: false,
                            permissions: new Set(role.permissions),
                        }));
                        // Update both current and original state after save
                        setRoles(updated_roles);
                        setOriginalRoles(updated_roles.map((r) => ({
                            role_id: r.role_id,
                            role_name: r.role_name,
                            selected: r.selected,
                            permissions: new Set(r.permissions),
                        })));
                    }
                }
                else {
                    toast.error(data.error || "Failed to save roles and permissions");
                }
            }
        }
        catch (error) {
            toast.error(user_id ? "Failed to update user roles" : "Failed to save roles and permissions");
        }
        finally {
            setSaving(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: `cls_roles_matrix flex items-center justify-center p-8 ${className || ""}`, children: _jsx(Loader2, { className: "h-6 w-6 animate-spin text-slate-400" }) }));
    }
    // Helper function to get user initials
    const getUserInitials = (name, email) => {
        if (name) {
            const parts = name.trim().split(/\s+/);
            if (parts.length >= 2) {
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            }
            return name.substring(0, 2).toUpperCase();
        }
        return email.substring(0, 2).toUpperCase();
    };
    return (_jsxs("div", { className: `cls_roles_matrix flex flex-col gap-4 w-full ${className || ""}`, children: [user_id && userInfo && (_jsxs("div", { className: "cls_roles_matrix_user_info flex items-center gap-4 p-4 border rounded-lg bg-muted/50", children: [_jsxs(Avatar, { className: "cls_roles_matrix_user_avatar h-12 w-12", children: [_jsx(AvatarImage, { src: userInfo.profile_picture_url || undefined, alt: userInfo.name ? `Profile picture of ${userInfo.name}` : "Profile picture", className: "cls_roles_matrix_user_avatar_image" }), _jsx(AvatarFallback, { className: "cls_roles_matrix_user_avatar_fallback bg-slate-200 text-slate-600", children: getUserInitials(userInfo.name, userInfo.email_address) })] }), _jsxs("div", { className: "cls_roles_matrix_user_info_details flex flex-col", children: [_jsx("span", { className: "cls_roles_matrix_user_name font-semibold text-lg", children: userInfo.name || userInfo.email_address }), userInfo.name && (_jsx("span", { className: "cls_roles_matrix_user_email text-sm text-muted-foreground", children: userInfo.email_address }))] })] })), _jsx("div", { className: "cls_roles_matrix_header flex items-center justify-between", children: _jsx("div", { className: "cls_roles_matrix_header_left", children: add_button_enabled && (_jsxs(Button, { onClick: () => setIsAddDialogOpen(true), variant: "default", size: "sm", className: "cls_roles_matrix_add_button", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Role"] })) }) }), _jsx("div", { className: "cls_roles_matrix_table_container border rounded-lg overflow-auto w-full", children: _jsxs(Table, { className: "cls_roles_matrix_table w-full", children: [_jsx(TableHeader, { className: "cls_roles_matrix_table_header", children: _jsxs(TableRow, { className: "cls_roles_matrix_table_header_row", children: [role_name_selection_enabled && (_jsx(TableHead, { className: "cls_roles_matrix_table_header_role_checkbox w-12" })), _jsx(TableHead, { className: "cls_roles_matrix_table_header_role_name", children: "Role Name" }), permissions.map((permission_name) => (_jsx(TableHead, { className: "cls_roles_matrix_table_header_permission text-center", children: permission_name }, permission_name)))] }) }), _jsx(TableBody, { className: "cls_roles_matrix_table_body", children: roles.length === 0 ? (_jsx(TableRow, { className: "cls_roles_matrix_table_row_empty", children: _jsx(TableCell, { colSpan: permissions.length + (role_name_selection_enabled ? 2 : 1), className: "text-center text-muted-foreground py-8", children: "No roles found. Add a role to get started." }) })) : (roles.map((role, role_index) => (_jsxs(TableRow, { className: "cls_roles_matrix_table_row", children: [role_name_selection_enabled && (_jsx(TableCell, { className: "cls_roles_matrix_table_cell_role_checkbox text-center", children: _jsx("div", { className: "cls_roles_matrix_role_checkbox_wrapper flex items-center justify-center", children: _jsx(Checkbox, { checked: role.selected, onCheckedChange: () => handleRoleSelectionToggle(role_index), className: "cls_roles_matrix_role_checkbox" }) }) })), _jsx(TableCell, { className: "cls_roles_matrix_table_cell_role_name font-medium", children: role.role_name }), permissions.map((permission_name) => (_jsx(TableCell, { className: "cls_roles_matrix_table_cell_permission text-center", children: _jsx("div", { className: "cls_roles_matrix_permission_checkbox_wrapper flex items-center justify-center", children: _jsx(Checkbox, { checked: role.permissions.has(permission_name), onCheckedChange: () => handlePermissionToggle(role_index, permission_name), disabled: permissions_read_only, className: "cls_roles_matrix_permission_checkbox" }) }) }, permission_name)))] }, role_index)))) })] }) }), show_save_cancel && (_jsxs("div", { className: "cls_roles_matrix_footer flex items-center justify-end gap-2", children: [_jsx(Button, { onClick: handleSave, disabled: saving, variant: "default", size: "sm", className: "cls_roles_matrix_save_button", children: saving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Saving..."] })) : (_jsxs(_Fragment, { children: [_jsx(CircleCheck, { className: "h-4 w-4 mr-2" }), "Save"] })) }), _jsxs(Button, { onClick: handleCancel, variant: "outline", size: "sm", className: "cls_roles_matrix_cancel_button", children: [_jsx(CircleX, { className: "h-4 w-4 mr-2" }), "Cancel"] })] })), _jsx(Dialog, { open: isAddDialogOpen, onOpenChange: setIsAddDialogOpen, children: _jsxs(DialogContent, { className: "cls_roles_matrix_add_dialog", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add New Role" }), _jsx(DialogDescription, { children: "Enter a name for the new role. You can assign permissions after creating the role." })] }), _jsx("div", { className: "cls_roles_matrix_add_dialog_content flex flex-col gap-4 py-4", children: _jsxs("div", { className: "cls_roles_matrix_add_dialog_field flex flex-col gap-2", children: [_jsx(Label, { htmlFor: "role_name", className: "cls_roles_matrix_add_dialog_label", children: "Role Name" }), _jsx(Input, { id: "role_name", value: newRoleName, onChange: (e) => setNewRoleName(e.target.value), placeholder: "Enter role name", className: "cls_roles_matrix_add_dialog_input", onKeyDown: (e) => {
                                            if (e.key === "Enter") {
                                                handleAddRole();
                                            }
                                        } })] }) }), _jsxs(DialogFooter, { className: "cls_roles_matrix_add_dialog_footer", children: [_jsx(Button, { onClick: handleAddRole, variant: "default", className: "cls_roles_matrix_add_dialog_save", children: "Add Role" }), _jsx(Button, { onClick: () => {
                                        setIsAddDialogOpen(false);
                                        setNewRoleName("");
                                    }, variant: "outline", className: "cls_roles_matrix_add_dialog_cancel", children: "Cancel" })] })] }) })] }));
}
