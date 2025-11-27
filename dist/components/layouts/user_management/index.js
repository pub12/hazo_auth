// file_description: User Management layout component with three tabs for managing users, roles, and permissions
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// section: imports
import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { use_hazo_auth } from "../shared/hooks/use_hazo_auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "../../ui/table";
import { Button } from "../../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "../../ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { RolesMatrix } from "./components/roles_matrix";
import { UserX, KeyRound, Edit, Trash2, Loader2, CircleCheck, CircleX, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
// section: component
/**
 * User Management layout component with three tabs
 * Tab 1: Manage Users - data table with user details and actions
 * Tab 2: Roles - roles-permissions matrix
 * Tab 3: Permissions - manage permissions from DB and config
 * @param props - Component props
 * @returns User Management layout component
 */
export function UserManagementLayout({ className }) {
    // Permission checks
    const authResult = use_hazo_auth();
    const hasUserManagementPermission = authResult.authenticated &&
        authResult.permissions.includes("admin_user_management");
    const hasRoleManagementPermission = authResult.authenticated &&
        authResult.permissions.includes("admin_role_management");
    const hasPermissionManagementPermission = authResult.authenticated &&
        authResult.permissions.includes("admin_permission_management");
    // Determine which tabs to show
    const showUsersTab = hasUserManagementPermission;
    const showRolesTab = hasRoleManagementPermission;
    const showPermissionsTab = hasPermissionManagementPermission;
    const hasAnyPermission = showUsersTab || showRolesTab || showPermissionsTab;
    // Tab 1: Users state
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
    const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
    const [userDetailDialogOpen, setUserDetailDialogOpen] = useState(false);
    const [assignRolesDialogOpen, setAssignRolesDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [usersActionLoading, setUsersActionLoading] = useState(false);
    // Tab 3: Permissions state
    const [permissions, setPermissions] = useState([]);
    const [permissionsLoading, setPermissionsLoading] = useState(true);
    const [editPermissionDialogOpen, setEditPermissionDialogOpen] = useState(false);
    const [addPermissionDialogOpen, setAddPermissionDialogOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState(null);
    const [editDescription, setEditDescription] = useState("");
    const [newPermissionName, setNewPermissionName] = useState("");
    const [newPermissionDescription, setNewPermissionDescription] = useState("");
    const [permissionsActionLoading, setPermissionsActionLoading] = useState(false);
    const [migrateLoading, setMigrateLoading] = useState(false);
    // Load users function (reusable)
    const loadUsers = useCallback(async () => {
        setUsersLoading(true);
        try {
            const response = await fetch("/api/hazo_auth/user_management/users");
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            }
            else {
                toast.error("Failed to load users");
            }
        }
        catch (error) {
            toast.error("Failed to load users");
        }
        finally {
            setUsersLoading(false);
        }
    }, []);
    // Load users (only if user has permission)
    useEffect(() => {
        if (!showUsersTab) {
            setUsersLoading(false);
            return;
        }
        void loadUsers();
    }, [showUsersTab, loadUsers]);
    // Load permissions (only if user has permission)
    useEffect(() => {
        if (!showPermissionsTab) {
            setPermissionsLoading(false);
            return;
        }
        const loadPermissions = async () => {
            setPermissionsLoading(true);
            try {
                const response = await fetch("/api/hazo_auth/user_management/permissions");
                const data = await response.json();
                if (data.success) {
                    const db_perms = data.db_permissions.map((p) => ({
                        id: p.id,
                        permission_name: p.permission_name,
                        description: p.description,
                        source: "db",
                    }));
                    const config_perms = data.config_permissions.map((name) => ({
                        id: 0, // Temporary ID for config permissions
                        permission_name: name,
                        description: "",
                        source: "config",
                    }));
                    setPermissions([...db_perms, ...config_perms]);
                }
                else {
                    toast.error("Failed to load permissions");
                }
            }
            catch (error) {
                toast.error("Failed to load permissions");
            }
            finally {
                setPermissionsLoading(false);
            }
        };
        void loadPermissions();
    }, [showPermissionsTab]);
    // Handle deactivate user
    const handleDeactivateUser = async () => {
        if (!selectedUser)
            return;
        setUsersActionLoading(true);
        try {
            const response = await fetch("/api/user_management/users", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: selectedUser.id,
                    is_active: false,
                }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success("User deactivated successfully");
                setDeactivateDialogOpen(false);
                setSelectedUser(null);
                // Reload users
                const reload_response = await fetch("/api/user_management/users");
                const reload_data = await reload_response.json();
                if (reload_data.success) {
                    setUsers(reload_data.users);
                }
            }
            else {
                toast.error(data.error || "Failed to deactivate user");
            }
        }
        catch (error) {
            toast.error("Failed to deactivate user");
        }
        finally {
            setUsersActionLoading(false);
        }
    };
    // Handle reset password
    const handleResetPassword = async () => {
        if (!selectedUser)
            return;
        setUsersActionLoading(true);
        try {
            const response = await fetch("/api/user_management/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: selectedUser.id,
                }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Password reset email sent successfully");
                setResetPasswordDialogOpen(false);
                setSelectedUser(null);
            }
            else {
                toast.error(data.error || "Failed to send password reset email");
            }
        }
        catch (error) {
            toast.error("Failed to send password reset email");
        }
        finally {
            setUsersActionLoading(false);
        }
    };
    // Handle migrate permissions
    const handleMigratePermissions = async () => {
        var _a, _b;
        setMigrateLoading(true);
        try {
            const response = await fetch("/api/hazo_auth/user_management/permissions?action=migrate", {
                method: "POST",
            });
            const data = await response.json();
            if (data.success) {
                const created_count = ((_a = data.created) === null || _a === void 0 ? void 0 : _a.length) || 0;
                const skipped_count = ((_b = data.skipped) === null || _b === void 0 ? void 0 : _b.length) || 0;
                if (created_count > 0) {
                    toast.success(`Migrated ${created_count} permission(s) to database. ${skipped_count} already existed.`);
                }
                else {
                    toast.info(`All permissions already exist in database. ${skipped_count} skipped.`);
                }
                // Show detailed list in toast if there are changes
                if (data.created && data.created.length > 0) {
                    toast.info(`Created: ${data.created.join(", ")}`);
                }
                if (data.skipped && data.skipped.length > 0) {
                    toast.info(`Skipped: ${data.skipped.join(", ")}`);
                }
                // Reload permissions
                const reload_response = await fetch("/api/user_management/permissions");
                const reload_data = await reload_response.json();
                if (reload_data.success) {
                    const db_perms = reload_data.db_permissions.map((p) => ({
                        id: p.id,
                        permission_name: p.permission_name,
                        description: p.description,
                        source: "db",
                    }));
                    const config_perms = reload_data.config_permissions.map((name) => ({
                        id: 0,
                        permission_name: name,
                        description: "",
                        source: "config",
                    }));
                    setPermissions([...db_perms, ...config_perms]);
                }
            }
            else {
                toast.error(data.error || "Failed to migrate permissions");
            }
        }
        catch (error) {
            toast.error("Failed to migrate permissions");
        }
        finally {
            setMigrateLoading(false);
        }
    };
    // Handle edit permission
    const handleEditPermission = async () => {
        if (!editingPermission || editingPermission.source === "config")
            return;
        setPermissionsActionLoading(true);
        try {
            const response = await fetch("/api/user_management/permissions", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    permission_id: editingPermission.id,
                    description: editDescription,
                }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Permission updated successfully");
                setEditPermissionDialogOpen(false);
                setEditingPermission(null);
                setEditDescription("");
                // Reload permissions
                const reload_response = await fetch("/api/user_management/permissions");
                const reload_data = await reload_response.json();
                if (reload_data.success) {
                    const db_perms = reload_data.db_permissions.map((p) => ({
                        id: p.id,
                        permission_name: p.permission_name,
                        description: p.description,
                        source: "db",
                    }));
                    const config_perms = reload_data.config_permissions.map((name) => ({
                        id: 0,
                        permission_name: name,
                        description: "",
                        source: "config",
                    }));
                    setPermissions([...db_perms, ...config_perms]);
                }
            }
            else {
                toast.error(data.error || "Failed to update permission");
            }
        }
        catch (error) {
            toast.error("Failed to update permission");
        }
        finally {
            setPermissionsActionLoading(false);
        }
    };
    // Handle add permission
    const handleAddPermission = async () => {
        if (!newPermissionName.trim()) {
            toast.error("Permission name is required");
            return;
        }
        setPermissionsActionLoading(true);
        try {
            const response = await fetch("/api/user_management/permissions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    permission_name: newPermissionName.trim(),
                    description: newPermissionDescription.trim(),
                }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Permission created successfully");
                setAddPermissionDialogOpen(false);
                setNewPermissionName("");
                setNewPermissionDescription("");
                // Reload permissions
                const reload_response = await fetch("/api/user_management/permissions");
                const reload_data = await reload_response.json();
                if (reload_data.success) {
                    const db_perms = reload_data.db_permissions.map((p) => ({
                        id: p.id,
                        permission_name: p.permission_name,
                        description: p.description,
                        source: "db",
                    }));
                    const config_perms = reload_data.config_permissions.map((name) => ({
                        id: 0,
                        permission_name: name,
                        description: "",
                        source: "config",
                    }));
                    setPermissions([...db_perms, ...config_perms]);
                }
            }
            else {
                toast.error(data.error || "Failed to create permission");
            }
        }
        catch (error) {
            toast.error("Failed to create permission");
        }
        finally {
            setPermissionsActionLoading(false);
        }
    };
    // Handle delete permission
    const handleDeletePermission = async (permission) => {
        if (permission.source === "config")
            return;
        setPermissionsActionLoading(true);
        try {
            const response = await fetch(`/api/hazo_auth/user_management/permissions?permission_id=${permission.id}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Permission deleted successfully");
                // Reload permissions
                const reload_response = await fetch("/api/user_management/permissions");
                const reload_data = await reload_response.json();
                if (reload_data.success) {
                    const db_perms = reload_data.db_permissions.map((p) => ({
                        id: p.id,
                        permission_name: p.permission_name,
                        description: p.description,
                        source: "db",
                    }));
                    const config_perms = reload_data.config_permissions.map((name) => ({
                        id: 0,
                        permission_name: name,
                        description: "",
                        source: "config",
                    }));
                    setPermissions([...db_perms, ...config_perms]);
                }
            }
            else {
                toast.error(data.error || "Failed to delete permission");
            }
        }
        catch (error) {
            toast.error("Failed to delete permission");
        }
        finally {
            setPermissionsActionLoading(false);
        }
    };
    // Get user initials for avatar fallback
    const getUserInitials = (user) => {
        var _a, _b;
        if (user.name) {
            const parts = user.name.trim().split(" ");
            if (parts.length >= 2) {
                return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
            }
            return ((_a = user.name[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "";
        }
        if (user.email_address) {
            return ((_b = user.email_address[0]) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || "";
        }
        return "?";
    };
    return (_jsxs("div", { className: `cls_user_management_layout flex flex-col gap-4 w-full ${className || ""}`, children: [authResult.loading ? (_jsx("div", { className: "cls_user_management_permissions_loading flex items-center justify-center p-8", children: _jsx(Loader2, { className: "h-6 w-6 animate-spin text-slate-400" }) })) : !hasAnyPermission ? (_jsxs("div", { className: "cls_user_management_no_permissions flex flex-col items-center justify-center p-8 gap-4", children: [_jsx("p", { className: "text-lg font-semibold text-slate-700", children: "Access Denied" }), _jsx("p", { className: "text-sm text-muted-foreground text-center", children: "You don't have permission to access User Management. Please contact your administrator." })] })) : (_jsxs(Tabs, { defaultValue: showUsersTab ? "users" :
                    showRolesTab ? "roles" :
                        showPermissionsTab ? "permissions" : "users", className: "cls_user_management_tabs w-full", children: [_jsxs(TabsList, { className: "cls_user_management_tabs_list flex w-full", children: [showUsersTab && (_jsx(TabsTrigger, { value: "users", className: "cls_user_management_tabs_trigger flex-1", children: "Manage Users" })), showRolesTab && (_jsx(TabsTrigger, { value: "roles", className: "cls_user_management_tabs_trigger flex-1", children: "Roles" })), showPermissionsTab && (_jsx(TabsTrigger, { value: "permissions", className: "cls_user_management_tabs_trigger flex-1", children: "Permissions" }))] }), showUsersTab && (_jsx(TabsContent, { value: "users", className: "cls_user_management_tab_users w-full", children: usersLoading ? (_jsx("div", { className: "cls_user_management_users_loading flex items-center justify-center p-8", children: _jsx(Loader2, { className: "h-6 w-6 animate-spin text-slate-400" }) })) : (_jsx("div", { className: "cls_user_management_users_table_container border rounded-lg overflow-auto w-full", children: _jsxs(Table, { className: "cls_user_management_users_table w-full", children: [_jsx(TableHeader, { className: "cls_user_management_users_table_header", children: _jsxs(TableRow, { className: "cls_user_management_users_table_header_row", children: [_jsx(TableHead, { className: "cls_user_management_users_table_header_profile_pic w-16", children: "Photo" }), _jsx(TableHead, { className: "cls_user_management_users_table_header_id", children: "ID" }), _jsx(TableHead, { className: "cls_user_management_users_table_header_name", children: "Name" }), _jsx(TableHead, { className: "cls_user_management_users_table_header_email", children: "Email" }), _jsx(TableHead, { className: "cls_user_management_users_table_header_email_verified", children: "Email Verified" }), _jsx(TableHead, { className: "cls_user_management_users_table_header_is_active", children: "Active" }), _jsx(TableHead, { className: "cls_user_management_users_table_header_last_logon", children: "Last Logon" }), _jsx(TableHead, { className: "cls_user_management_users_table_header_created_at", children: "Created At" }), _jsx(TableHead, { className: "cls_user_management_users_table_header_actions text-right", children: "Actions" })] }) }), _jsx(TableBody, { className: "cls_user_management_users_table_body", children: users.length === 0 ? (_jsx(TableRow, { className: "cls_user_management_users_table_row_empty", children: _jsx(TableCell, { colSpan: 9, className: "text-center text-muted-foreground py-8", children: "No users found." }) })) : (users.map((user) => (_jsxs(TableRow, { className: "cls_user_management_users_table_row cursor-pointer hover:bg-muted/50", onClick: () => {
                                                setSelectedUser(user);
                                                setUserDetailDialogOpen(true);
                                            }, children: [_jsx(TableCell, { className: "cls_user_management_users_table_cell_profile_pic", children: _jsxs(Avatar, { className: "cls_user_management_users_table_avatar h-8 w-8", children: [_jsx(AvatarImage, { src: user.profile_picture_url || undefined, alt: user.name ? `Profile picture of ${user.name}` : "Profile picture", className: "cls_user_management_users_table_avatar_image" }), _jsx(AvatarFallback, { className: "cls_user_management_users_table_avatar_fallback bg-slate-200 text-slate-600 text-xs", children: getUserInitials(user) })] }) }), _jsxs(TableCell, { className: "cls_user_management_users_table_cell_id font-mono text-xs", children: [user.id.substring(0, 8), "..."] }), _jsx(TableCell, { className: "cls_user_management_users_table_cell_name", children: user.name || "-" }), _jsx(TableCell, { className: "cls_user_management_users_table_cell_email", children: user.email_address }), _jsx(TableCell, { className: "cls_user_management_users_table_cell_email_verified", children: user.email_verified ? (_jsx("span", { className: "text-green-600", children: "Yes" })) : (_jsx("span", { className: "text-red-600", children: "No" })) }), _jsx(TableCell, { className: "cls_user_management_users_table_cell_is_active", children: user.is_active ? (_jsx("span", { className: "text-green-600", children: "Active" })) : (_jsx("span", { className: "text-red-600", children: "Inactive" })) }), _jsx(TableCell, { className: "cls_user_management_users_table_cell_last_logon", children: user.last_logon
                                                        ? new Date(user.last_logon).toLocaleDateString()
                                                        : "-" }), _jsx(TableCell, { className: "cls_user_management_users_table_cell_created_at", children: user.created_at
                                                        ? new Date(user.created_at).toLocaleDateString()
                                                        : "-" }), _jsx(TableCell, { className: "cls_user_management_users_table_cell_actions text-right", children: _jsx(TooltipProvider, { children: _jsxs("div", { className: "cls_user_management_users_table_actions flex items-center justify-end gap-2", onClick: (e) => e.stopPropagation(), children: [_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { onClick: () => {
                                                                                    setSelectedUser(user);
                                                                                    setAssignRolesDialogOpen(true);
                                                                                }, variant: "outline", size: "sm", className: "cls_user_management_users_table_action_assign_roles", children: _jsx(UserPlus, { className: "h-4 w-4" }) }) }), _jsx(TooltipContent, { children: _jsx("p", { children: "Assign Roles" }) })] }), user.is_active && (_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { onClick: () => {
                                                                                    setSelectedUser(user);
                                                                                    setDeactivateDialogOpen(true);
                                                                                }, variant: "outline", size: "sm", className: "cls_user_management_users_table_action_deactivate", children: _jsx(UserX, { className: "h-4 w-4" }) }) }), _jsx(TooltipContent, { children: _jsx("p", { children: "Deactivate" }) })] })), _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { onClick: () => {
                                                                                    setSelectedUser(user);
                                                                                    setResetPasswordDialogOpen(true);
                                                                                }, variant: "outline", size: "sm", className: "cls_user_management_users_table_action_reset_password", children: _jsx(KeyRound, { className: "h-4 w-4" }) }) }), _jsx(TooltipContent, { children: _jsx("p", { children: "Reset Password" }) })] })] }) }) })] }, user.id)))) })] }) })) })), showRolesTab && (_jsx(TabsContent, { value: "roles", className: "cls_user_management_tab_roles w-full", children: _jsx(RolesMatrix, { add_button_enabled: true, role_name_selection_enabled: false, onSave: (data) => {
                                // Data is already saved by RolesMatrix component
                                console.log("Roles saved:", data);
                            } }) })), showPermissionsTab && (_jsx(TabsContent, { value: "permissions", className: "cls_user_management_tab_permissions w-full", children: _jsxs("div", { className: "cls_user_management_permissions_container flex flex-col gap-4 w-full", children: [_jsxs("div", { className: "cls_user_management_permissions_header flex items-center justify-between", children: [_jsx("div", { className: "cls_user_management_permissions_header_left flex items-center gap-2", children: _jsxs(Button, { onClick: () => setAddPermissionDialogOpen(true), variant: "default", size: "sm", className: "cls_user_management_permissions_add_button", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Permission"] }) }), _jsx("div", { className: "cls_user_management_permissions_header_right", children: _jsx(Button, { onClick: handleMigratePermissions, disabled: migrateLoading, variant: "default", size: "sm", className: "cls_user_management_permissions_migrate_button", children: migrateLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Migrating..."] })) : ("Migrate config to database") }) })] }), permissionsLoading ? (_jsx("div", { className: "cls_user_management_permissions_loading flex items-center justify-center p-8", children: _jsx(Loader2, { className: "h-6 w-6 animate-spin text-slate-400" }) })) : (_jsx("div", { className: "cls_user_management_permissions_table_container border rounded-lg overflow-auto w-full", children: _jsxs(Table, { className: "cls_user_management_permissions_table w-full", children: [_jsx(TableHeader, { className: "cls_user_management_permissions_table_header", children: _jsxs(TableRow, { className: "cls_user_management_permissions_table_header_row", children: [_jsx(TableHead, { className: "cls_user_management_permissions_table_header_name", children: "Permission Name" }), _jsx(TableHead, { className: "cls_user_management_permissions_table_header_description", children: "Description" }), _jsx(TableHead, { className: "cls_user_management_permissions_table_header_source", children: "Source" }), _jsx(TableHead, { className: "cls_user_management_permissions_table_header_actions text-right", children: "Actions" })] }) }), _jsx(TableBody, { className: "cls_user_management_permissions_table_body", children: permissions.length === 0 ? (_jsx(TableRow, { className: "cls_user_management_permissions_table_row_empty", children: _jsx(TableCell, { colSpan: 4, className: "text-center text-muted-foreground py-8", children: "No permissions found." }) })) : (permissions.map((permission) => (_jsxs(TableRow, { className: "cls_user_management_permissions_table_row", children: [_jsx(TableCell, { className: `cls_user_management_permissions_table_cell_name font-medium ${permission.source === "db" ? "text-blue-600" : "text-purple-600"}`, children: permission.permission_name }), _jsx(TableCell, { className: "cls_user_management_permissions_table_cell_description", children: permission.description || "-" }), _jsx(TableCell, { className: "cls_user_management_permissions_table_cell_source", children: _jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${permission.source === "db"
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : "bg-purple-100 text-purple-700"}`, children: permission.source === "db" ? "Database" : "Config" }) }), _jsx(TableCell, { className: "cls_user_management_permissions_table_cell_actions text-right", children: _jsx("div", { className: "cls_user_management_permissions_table_actions flex items-center justify-end gap-2", children: permission.source === "db" && (_jsxs(_Fragment, { children: [_jsxs(Button, { onClick: () => {
                                                                                setEditingPermission(permission);
                                                                                setEditDescription(permission.description);
                                                                                setEditPermissionDialogOpen(true);
                                                                            }, variant: "outline", size: "sm", className: "cls_user_management_permissions_table_action_edit", children: [_jsx(Edit, { className: "h-4 w-4 mr-1" }), "Edit"] }), _jsxs(Button, { onClick: () => handleDeletePermission(permission), disabled: permissionsActionLoading, variant: "outline", size: "sm", className: "cls_user_management_permissions_table_action_delete text-destructive", children: [_jsx(Trash2, { className: "h-4 w-4 mr-1" }), "Delete"] })] })) }) })] }, `${permission.source}-${permission.id}-${permission.permission_name}`)))) })] }) }))] }) }))] })), _jsx(AlertDialog, { open: deactivateDialogOpen, onOpenChange: setDeactivateDialogOpen, children: _jsxs(AlertDialogContent, { className: "cls_user_management_deactivate_dialog", children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Deactivate User" }), _jsxs(AlertDialogDescription, { children: ["Are you sure you want to deactivate ", (selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.name) || (selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.email_address), "? They will not be able to log in until reactivated."] })] }), _jsxs(AlertDialogFooter, { className: "cls_user_management_deactivate_dialog_footer", children: [_jsx(AlertDialogAction, { onClick: handleDeactivateUser, disabled: usersActionLoading, className: "cls_user_management_deactivate_dialog_confirm", children: usersActionLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Deactivating..."] })) : ("Deactivate") }), _jsx(AlertDialogCancel, { onClick: () => {
                                        setDeactivateDialogOpen(false);
                                        setSelectedUser(null);
                                    }, className: "cls_user_management_deactivate_dialog_cancel", children: "Cancel" })] })] }) }), _jsx(AlertDialog, { open: resetPasswordDialogOpen, onOpenChange: setResetPasswordDialogOpen, children: _jsxs(AlertDialogContent, { className: "cls_user_management_reset_password_dialog", children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Reset Password" }), _jsxs(AlertDialogDescription, { children: ["Send a password reset email to ", selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.email_address, "? They will receive a link to reset their password."] })] }), _jsxs(AlertDialogFooter, { className: "cls_user_management_reset_password_dialog_footer", children: [_jsx(AlertDialogAction, { onClick: handleResetPassword, disabled: usersActionLoading, className: "cls_user_management_reset_password_dialog_confirm", children: usersActionLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Sending..."] })) : ("Send Reset Email") }), _jsx(AlertDialogCancel, { onClick: () => {
                                        setResetPasswordDialogOpen(false);
                                        setSelectedUser(null);
                                    }, className: "cls_user_management_reset_password_dialog_cancel", children: "Cancel" })] })] }) }), _jsx(Dialog, { open: editPermissionDialogOpen, onOpenChange: setEditPermissionDialogOpen, children: _jsxs(DialogContent, { className: "cls_user_management_edit_permission_dialog", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Edit Permission" }), _jsxs(DialogDescription, { children: ["Update the description for permission: ", editingPermission === null || editingPermission === void 0 ? void 0 : editingPermission.permission_name] })] }), _jsx("div", { className: "cls_user_management_edit_permission_dialog_content flex flex-col gap-4 py-4", children: _jsxs("div", { className: "cls_user_management_edit_permission_dialog_field flex flex-col gap-2", children: [_jsx(Label, { htmlFor: "permission_description", className: "cls_user_management_edit_permission_dialog_label", children: "Description" }), _jsx(Input, { id: "permission_description", value: editDescription, onChange: (e) => setEditDescription(e.target.value), placeholder: "Enter permission description", className: "cls_user_management_edit_permission_dialog_input" })] }) }), _jsxs(DialogFooter, { className: "cls_user_management_edit_permission_dialog_footer", children: [_jsx(Button, { onClick: handleEditPermission, disabled: permissionsActionLoading, variant: "default", className: "cls_user_management_edit_permission_dialog_save", children: permissionsActionLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Saving..."] })) : (_jsxs(_Fragment, { children: [_jsx(CircleCheck, { className: "h-4 w-4 mr-2" }), "Save"] })) }), _jsxs(Button, { onClick: () => {
                                        setEditPermissionDialogOpen(false);
                                        setEditingPermission(null);
                                        setEditDescription("");
                                    }, variant: "outline", className: "cls_user_management_edit_permission_dialog_cancel", children: [_jsx(CircleX, { className: "h-4 w-4 mr-2" }), "Cancel"] })] })] }) }), _jsx(Dialog, { open: addPermissionDialogOpen, onOpenChange: setAddPermissionDialogOpen, children: _jsxs(DialogContent, { className: "cls_user_management_add_permission_dialog", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add New Permission" }), _jsx(DialogDescription, { children: "Create a new permission that can be assigned to roles." })] }), _jsxs("div", { className: "cls_user_management_add_permission_dialog_content flex flex-col gap-4 py-4", children: [_jsxs("div", { className: "cls_user_management_add_permission_dialog_field flex flex-col gap-2", children: [_jsx(Label, { htmlFor: "new_permission_name", className: "cls_user_management_add_permission_dialog_label", children: "Permission Name *" }), _jsx(Input, { id: "new_permission_name", value: newPermissionName, onChange: (e) => setNewPermissionName(e.target.value), placeholder: "Enter permission name (e.g., READ_USERS)", className: "cls_user_management_add_permission_dialog_input", onKeyDown: (e) => {
                                                if (e.key === "Enter") {
                                                    handleAddPermission();
                                                }
                                            } })] }), _jsxs("div", { className: "cls_user_management_add_permission_dialog_field flex flex-col gap-2", children: [_jsx(Label, { htmlFor: "new_permission_description", className: "cls_user_management_add_permission_dialog_label", children: "Description" }), _jsx(Input, { id: "new_permission_description", value: newPermissionDescription, onChange: (e) => setNewPermissionDescription(e.target.value), placeholder: "Enter permission description (optional)", className: "cls_user_management_add_permission_dialog_input", onKeyDown: (e) => {
                                                if (e.key === "Enter") {
                                                    handleAddPermission();
                                                }
                                            } })] })] }), _jsxs(DialogFooter, { className: "cls_user_management_add_permission_dialog_footer", children: [_jsx(Button, { onClick: handleAddPermission, disabled: permissionsActionLoading || !newPermissionName.trim(), variant: "default", className: "cls_user_management_add_permission_dialog_save", children: permissionsActionLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Creating..."] })) : (_jsxs(_Fragment, { children: [_jsx(CircleCheck, { className: "h-4 w-4 mr-2" }), "Create Permission"] })) }), _jsxs(Button, { onClick: () => {
                                        setAddPermissionDialogOpen(false);
                                        setNewPermissionName("");
                                        setNewPermissionDescription("");
                                    }, variant: "outline", className: "cls_user_management_add_permission_dialog_cancel", children: [_jsx(CircleX, { className: "h-4 w-4 mr-2" }), "Cancel"] })] })] }) }), _jsx(Dialog, { open: userDetailDialogOpen, onOpenChange: setUserDetailDialogOpen, children: _jsxs(DialogContent, { className: "cls_user_management_user_detail_dialog max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "User Details" }), _jsxs(DialogDescription, { children: ["Complete information for ", (selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.name) || (selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.email_address)] })] }), _jsx("div", { className: "cls_user_management_user_detail_dialog_content flex flex-col gap-4 py-4", children: selectedUser && (_jsxs("div", { className: "cls_user_management_user_detail_fields grid grid-cols-1 gap-4", children: [_jsxs("div", { className: "cls_user_management_user_detail_field_profile_pic flex flex-col gap-2", children: [_jsx(Label, { className: "cls_user_management_user_detail_label font-semibold", children: "Profile Picture" }), _jsxs("div", { className: "cls_user_management_user_detail_profile_pic_container flex items-center gap-4", children: [_jsxs(Avatar, { className: "cls_user_management_user_detail_avatar h-16 w-16", children: [_jsx(AvatarImage, { src: selectedUser.profile_picture_url || undefined, alt: selectedUser.name ? `Profile picture of ${selectedUser.name}` : "Profile picture", className: "cls_user_management_user_detail_avatar_image" }), _jsx(AvatarFallback, { className: "cls_user_management_user_detail_avatar_fallback bg-slate-200 text-slate-600 text-lg", children: getUserInitials(selectedUser) })] }), _jsxs("div", { className: "cls_user_management_user_detail_profile_pic_info flex flex-col gap-1", children: [_jsx("span", { className: "cls_user_management_user_detail_profile_pic_url text-sm text-muted-foreground", children: selectedUser.profile_picture_url || "No profile picture" }), _jsxs("span", { className: "cls_user_management_user_detail_profile_pic_source text-xs text-muted-foreground", children: ["Source: ", selectedUser.profile_source || "N/A"] })] })] })] }), _jsxs("div", { className: "cls_user_management_user_detail_field_id flex flex-col gap-2", children: [_jsx(Label, { className: "cls_user_management_user_detail_label font-semibold", children: "User ID" }), _jsx("div", { className: "cls_user_management_user_detail_id_value font-mono text-sm bg-muted p-2 rounded", children: selectedUser.id })] }), _jsxs("div", { className: "cls_user_management_user_detail_field_name flex flex-col gap-2", children: [_jsx(Label, { className: "cls_user_management_user_detail_label font-semibold", children: "Name" }), _jsx("div", { className: "cls_user_management_user_detail_name_value text-sm", children: selectedUser.name || "-" })] }), _jsxs("div", { className: "cls_user_management_user_detail_field_email flex flex-col gap-2", children: [_jsx(Label, { className: "cls_user_management_user_detail_label font-semibold", children: "Email Address" }), _jsx("div", { className: "cls_user_management_user_detail_email_value text-sm", children: selectedUser.email_address })] }), _jsxs("div", { className: "cls_user_management_user_detail_field_email_verified flex flex-col gap-2", children: [_jsx(Label, { className: "cls_user_management_user_detail_label font-semibold", children: "Email Verified" }), _jsx("div", { className: "cls_user_management_user_detail_email_verified_value", children: selectedUser.email_verified ? (_jsx("span", { className: "text-green-600 font-medium", children: "Yes" })) : (_jsx("span", { className: "text-red-600 font-medium", children: "No" })) })] }), _jsxs("div", { className: "cls_user_management_user_detail_field_is_active flex flex-col gap-2", children: [_jsx(Label, { className: "cls_user_management_user_detail_label font-semibold", children: "Active Status" }), _jsx("div", { className: "cls_user_management_user_detail_is_active_value", children: selectedUser.is_active ? (_jsx("span", { className: "text-green-600 font-medium", children: "Active" })) : (_jsx("span", { className: "text-red-600 font-medium", children: "Inactive" })) })] }), _jsxs("div", { className: "cls_user_management_user_detail_field_last_logon flex flex-col gap-2", children: [_jsx(Label, { className: "cls_user_management_user_detail_label font-semibold", children: "Last Logon" }), _jsx("div", { className: "cls_user_management_user_detail_last_logon_value text-sm", children: selectedUser.last_logon ? (_jsx("span", { className: "font-medium", children: new Date(selectedUser.last_logon).toLocaleString(undefined, {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        second: "2-digit",
                                                        timeZoneName: "short",
                                                    }) })) : (_jsx("span", { className: "text-muted-foreground", children: "Never" })) })] }), _jsxs("div", { className: "cls_user_management_user_detail_field_created_at flex flex-col gap-2", children: [_jsx(Label, { className: "cls_user_management_user_detail_label font-semibold", children: "Created At" }), _jsx("div", { className: "cls_user_management_user_detail_created_at_value text-sm", children: selectedUser.created_at ? (_jsx("span", { className: "font-medium", children: new Date(selectedUser.created_at).toLocaleString(undefined, {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        second: "2-digit",
                                                        timeZoneName: "short",
                                                    }) })) : (_jsx("span", { className: "text-muted-foreground", children: "-" })) })] })] })) }), _jsx(DialogFooter, { className: "cls_user_management_user_detail_dialog_footer", children: _jsx(Button, { onClick: () => setUserDetailDialogOpen(false), variant: "outline", className: "cls_user_management_user_detail_dialog_close", children: "Close" }) })] }) }), _jsx(Dialog, { open: assignRolesDialogOpen, onOpenChange: setAssignRolesDialogOpen, children: _jsxs(DialogContent, { className: "cls_user_management_assign_roles_dialog max-w-4xl max-h-[80vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Assign Roles to User" }), _jsxs(DialogDescription, { children: ["Select roles to assign to ", (selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.name) || (selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.email_address), ". Check the roles you want to assign, then click Save."] })] }), _jsx("div", { className: "cls_user_management_assign_roles_dialog_content py-4", children: _jsx(RolesMatrix, { add_button_enabled: false, role_name_selection_enabled: true, permissions_read_only: true, show_save_cancel: true, user_id: selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.id, onSave: (data) => {
                                    // Data is already saved by RolesMatrix component
                                    console.log("User roles saved:", data);
                                    // Refresh users list to show updated roles
                                    void loadUsers();
                                    setAssignRolesDialogOpen(false);
                                    setSelectedUser(null);
                                }, onCancel: () => {
                                    setAssignRolesDialogOpen(false);
                                    setSelectedUser(null);
                                }, className: "cls_user_management_assign_roles_matrix" }) })] }) })] }));
}
