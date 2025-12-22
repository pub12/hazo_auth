// file_description: RBAC/HRBAC Test layout component for testing role-based and hierarchical access control
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// section: imports
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Checkbox } from "../../ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "../../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "../../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { TreeView } from "../../ui/tree-view";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Loader2, Play, AlertCircle, CheckCircle, XCircle, Shield, Building2, FolderTree, User, RefreshCw, } from "lucide-react";
import { useHazoAuthConfig } from "../../../contexts/hazo_auth_provider";
import { use_hazo_auth } from "../shared/hooks/use_hazo_auth";
import { toast } from "sonner";
const SCOPE_LEVEL_LABELS = {
    hazo_scopes_l1: "Level 1",
    hazo_scopes_l2: "Level 2",
    hazo_scopes_l3: "Level 3",
    hazo_scopes_l4: "Level 4",
    hazo_scopes_l5: "Level 5",
    hazo_scopes_l6: "Level 6",
    hazo_scopes_l7: "Level 7",
};
// Convert ScopeTreeNode to TreeDataItem format for selection
function convertToTreeData(nodes) {
    return nodes.map((node) => {
        const hasChildren = node.children && node.children.length > 0;
        const item = {
            id: node.id,
            name: `${node.name} (${node.seq})`,
            icon: Building2,
            scopeData: node,
        };
        if (hasChildren) {
            item.children = convertToTreeData(node.children);
        }
        return item;
    });
}
// Get user initials for avatar fallback
function getUserInitials(user) {
    var _a, _b;
    if (user.name) {
        const parts = user.name.trim().split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return ((_a = user.name[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "";
    }
    return ((_b = user.email_address[0]) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || "?";
}
// section: component
/**
 * RBAC/HRBAC Test layout component
 * Allows testing permissions and scope access for different users
 * @param props - Component props
 * @returns RBAC test layout component
 */
export function RbacTestLayout({ className, hrbacEnabled = false, }) {
    var _a;
    const { apiBasePath } = useHazoAuthConfig();
    const authResult = use_hazo_auth();
    // Users state
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    // Selected user's permissions and scopes
    const [userPermissions, setUserPermissions] = useState([]);
    const [userScopes, setUserScopes] = useState([]);
    const [userDataLoading, setUserDataLoading] = useState(false);
    // Available permissions state
    const [availablePermissions, setAvailablePermissions] = useState([]);
    const [permissionsLoading, setPermissionsLoading] = useState(true);
    // RBAC test state
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [rbacTesting, setRbacTesting] = useState(false);
    const [rbacResult, setRbacResult] = useState(null);
    // HRBAC scope tree state
    const [scopeTree, setScopeTree] = useState([]);
    const [treeLoading, setTreeLoading] = useState(false);
    const [selectedTreeItem, setSelectedTreeItem] = useState();
    // HRBAC test state
    const [hrbacPermissions, setHrbacPermissions] = useState([]);
    const [hrbacTesting, setHrbacTesting] = useState(false);
    const [hrbacResult, setHrbacResult] = useState(null);
    // Load users
    useEffect(() => {
        const loadUsers = async () => {
            var _a;
            setUsersLoading(true);
            try {
                const response = await fetch(`${apiBasePath}/user_management/users`);
                const data = await response.json();
                if (data.success) {
                    setUsers(data.users || []);
                    // Select current user by default if available
                    if ((_a = authResult.user) === null || _a === void 0 ? void 0 : _a.id) {
                        setSelectedUserId(authResult.user.id);
                    }
                }
            }
            catch (error) {
                toast.error("Failed to load users");
            }
            finally {
                setUsersLoading(false);
            }
        };
        void loadUsers();
    }, [apiBasePath, (_a = authResult.user) === null || _a === void 0 ? void 0 : _a.id]);
    // Update selected user when ID changes
    useEffect(() => {
        if (selectedUserId) {
            const user = users.find((u) => u.id === selectedUserId);
            setSelectedUser(user || null);
        }
        else {
            setSelectedUser(null);
        }
    }, [selectedUserId, users]);
    // Load selected user's permissions and scopes
    const loadUserData = useCallback(async () => {
        if (!selectedUserId) {
            setUserPermissions([]);
            setUserScopes([]);
            return;
        }
        setUserDataLoading(true);
        try {
            // Step 1: Get user's assigned role IDs
            const userRolesResponse = await fetch(`${apiBasePath}/user_management/users/roles?user_id=${selectedUserId}`);
            const userRolesData = await userRolesResponse.json();
            if (userRolesData.success && Array.isArray(userRolesData.role_ids) && userRolesData.role_ids.length > 0) {
                // Step 2: Get all roles with their permissions
                const rolesResponse = await fetch(`${apiBasePath}/user_management/roles`);
                const rolesData = await rolesResponse.json();
                if (rolesData.success && Array.isArray(rolesData.roles)) {
                    // Step 3: Filter to user's roles and extract permissions
                    const userRoleIds = new Set(userRolesData.role_ids);
                    const allPermissions = new Set();
                    for (const role of rolesData.roles) {
                        if (userRoleIds.has(role.role_id)) {
                            if (role.permissions && Array.isArray(role.permissions)) {
                                role.permissions.forEach((p) => allPermissions.add(p));
                            }
                        }
                    }
                    setUserPermissions(Array.from(allPermissions));
                }
                else {
                    setUserPermissions([]);
                }
            }
            else {
                setUserPermissions([]);
            }
            // Load user scopes if HRBAC is enabled
            if (hrbacEnabled) {
                const scopesResponse = await fetch(`${apiBasePath}/user_management/users/scopes?user_id=${selectedUserId}&include_effective=true`);
                const scopesData = await scopesResponse.json();
                if (scopesData.success) {
                    setUserScopes(scopesData.direct_scopes || []);
                }
                else {
                    setUserScopes([]);
                }
            }
        }
        catch (error) {
            toast.error("Failed to load user data");
            setUserPermissions([]);
            setUserScopes([]);
        }
        finally {
            setUserDataLoading(false);
        }
    }, [apiBasePath, selectedUserId, hrbacEnabled]);
    useEffect(() => {
        void loadUserData();
    }, [loadUserData]);
    // Load available permissions
    useEffect(() => {
        const loadPermissions = async () => {
            setPermissionsLoading(true);
            try {
                const response = await fetch(`${apiBasePath}/user_management/permissions`);
                const data = await response.json();
                if (data.success) {
                    const dbPerms = data.db_permissions.map((p) => ({
                        id: p.id,
                        permission_name: p.permission_name,
                        description: p.description,
                        source: "db",
                    }));
                    const configPerms = data.config_permissions.map((name) => ({
                        id: 0,
                        permission_name: name,
                        description: "",
                        source: "config",
                    }));
                    // Dedupe by permission_name, preferring db source
                    const permMap = new Map();
                    for (const p of [...configPerms, ...dbPerms]) {
                        permMap.set(p.permission_name, p);
                    }
                    setAvailablePermissions(Array.from(permMap.values()));
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
    }, [apiBasePath]);
    // Load scope tree
    const loadScopeTree = useCallback(async () => {
        if (!hrbacEnabled)
            return;
        setTreeLoading(true);
        try {
            const params = new URLSearchParams({ action: "tree_all" });
            const response = await fetch(`${apiBasePath}/scope_management/scopes?${params}`);
            const data = await response.json();
            if (data.success) {
                setScopeTree(data.trees || []);
            }
            else {
                setScopeTree([]);
            }
        }
        catch (error) {
            setScopeTree([]);
        }
        finally {
            setTreeLoading(false);
        }
    }, [apiBasePath, hrbacEnabled]);
    useEffect(() => {
        void loadScopeTree();
    }, [loadScopeTree]);
    // Convert tree to TreeDataItem format
    const treeData = useMemo(() => {
        return convertToTreeData(scopeTree);
    }, [scopeTree]);
    // Handle tree item selection
    const handleTreeSelectChange = (item) => {
        setSelectedTreeItem(item);
    };
    // Handle RBAC permission toggle
    const handlePermissionToggle = (permission, checked) => {
        if (checked) {
            setSelectedPermissions((prev) => [...prev, permission]);
        }
        else {
            setSelectedPermissions((prev) => prev.filter((p) => p !== permission));
        }
    };
    // Handle HRBAC permission toggle
    const handleHrbacPermissionToggle = (permission, checked) => {
        if (checked) {
            setHrbacPermissions((prev) => [...prev, permission]);
        }
        else {
            setHrbacPermissions((prev) => prev.filter((p) => p !== permission));
        }
    };
    // Run RBAC test
    const handleRunRbacTest = async () => {
        if (!selectedUserId) {
            toast.error("Please select a user");
            return;
        }
        setRbacTesting(true);
        setRbacResult(null);
        try {
            const params = new URLSearchParams();
            params.append("test_user_id", selectedUserId);
            selectedPermissions.forEach((p) => {
                params.append("required_permissions", p);
            });
            const response = await fetch(`${apiBasePath}/rbac_test?${params}`);
            const data = await response.json();
            setRbacResult(data);
        }
        catch (error) {
            setRbacResult({
                success: false,
                authenticated: false,
                permission_ok: false,
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
        finally {
            setRbacTesting(false);
        }
    };
    // Run HRBAC test
    const handleRunHrbacTest = async () => {
        if (!selectedUserId) {
            toast.error("Please select a user");
            return;
        }
        if (!(selectedTreeItem === null || selectedTreeItem === void 0 ? void 0 : selectedTreeItem.scopeData)) {
            toast.error("Please select a scope from the tree");
            return;
        }
        setHrbacTesting(true);
        setHrbacResult(null);
        try {
            const params = new URLSearchParams();
            params.append("test_user_id", selectedUserId);
            params.append("scope_type", selectedTreeItem.scopeData.level);
            params.append("scope_id", selectedTreeItem.scopeData.id);
            hrbacPermissions.forEach((p) => {
                params.append("required_permissions", p);
            });
            const response = await fetch(`${apiBasePath}/rbac_test?${params}`);
            const data = await response.json();
            setHrbacResult(data);
        }
        catch (error) {
            setHrbacResult({
                success: false,
                authenticated: false,
                permission_ok: false,
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
        finally {
            setHrbacTesting(false);
        }
    };
    // Clear RBAC test
    const handleClearRbac = () => {
        setSelectedPermissions([]);
        setRbacResult(null);
    };
    // Clear HRBAC test
    const handleClearHrbac = () => {
        setSelectedTreeItem(undefined);
        setHrbacPermissions([]);
        setHrbacResult(null);
    };
    if (authResult.loading) {
        return (_jsx("div", { className: "cls_rbac_test_layout flex items-center justify-center p-8", children: _jsx(Loader2, { className: "h-6 w-6 animate-spin text-slate-400" }) }));
    }
    if (!authResult.authenticated) {
        return (_jsxs("div", { className: "cls_rbac_test_layout flex flex-col items-center justify-center p-8 gap-4", children: [_jsx(AlertCircle, { className: "h-12 w-12 text-red-500" }), _jsx("h1", { className: "text-xl font-semibold", children: "Authentication Required" }), _jsx("p", { className: "text-muted-foreground", children: "Please log in to access the RBAC test tool." })] }));
    }
    // Check for admin_test_access permission
    if (!authResult.permissions.includes("admin_test_access")) {
        return (_jsxs("div", { className: "cls_rbac_test_layout flex flex-col items-center justify-center p-8 gap-4", children: [_jsx(Shield, { className: "h-12 w-12 text-amber-500" }), _jsx("h1", { className: "text-xl font-semibold", children: "Access Denied" }), _jsxs("p", { className: "text-muted-foreground text-center", children: ["You need the ", _jsx("code", { className: "bg-muted px-1 py-0.5 rounded", children: "admin_test_access" }), " ", "permission to use the RBAC test tool."] })] }));
    }
    return (_jsxs("div", { className: `cls_rbac_test_layout flex flex-col gap-6 p-4 w-full max-w-5xl mx-auto ${className || ""}`, children: [_jsxs("div", { className: "cls_rbac_test_header", children: [_jsx("h1", { className: "text-2xl font-bold", children: "RBAC & HRBAC Test" }), _jsx("p", { className: "text-muted-foreground", children: "Test Role-Based Access Control (RBAC) and Hierarchical RBAC (HRBAC) for any user." })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [_jsx(User, { className: "h-5 w-5" }), "Select User to Test"] }), _jsx(CardDescription, { children: "Choose a user to test their permissions and scope access" })] }), _jsxs(CardContent, { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { htmlFor: "user_select", children: "User" }), usersLoading ? (_jsxs("div", { className: "flex items-center gap-2 p-2", children: [_jsx(Loader2, { className: "h-4 w-4 animate-spin" }), _jsx("span", { className: "text-sm text-muted-foreground", children: "Loading users..." })] })) : (_jsxs(Select, { value: selectedUserId, onValueChange: setSelectedUserId, children: [_jsx(SelectTrigger, { id: "user_select", className: "w-full", children: _jsx(SelectValue, { placeholder: "Select a user" }) }), _jsx(SelectContent, { children: users.map((user) => (_jsx(SelectItem, { value: user.id, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Avatar, { className: "h-6 w-6", children: [_jsx(AvatarImage, { src: user.profile_picture_url || undefined }), _jsx(AvatarFallback, { className: "bg-slate-200 text-slate-600 text-xs", children: getUserInitials(user) })] }), _jsx("span", { children: user.name || user.email_address }), user.name && (_jsxs("span", { className: "text-muted-foreground text-xs", children: ["(", user.email_address, ")"] }))] }) }, user.id))) })] }))] }), selectedUser && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/30", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Avatar, { className: "h-12 w-12", children: [_jsx(AvatarImage, { src: selectedUser.profile_picture_url || undefined }), _jsx(AvatarFallback, { className: "bg-slate-200 text-slate-600", children: getUserInitials(selectedUser) })] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: selectedUser.name || selectedUser.email_address }), selectedUser.name && (_jsx("p", { className: "text-sm text-muted-foreground", children: selectedUser.email_address })), _jsxs("p", { className: "text-xs text-muted-foreground font-mono", children: [selectedUser.id.substring(0, 8), "..."] })] })] }), userDataLoading ? (_jsx("div", { className: "flex items-center justify-center", children: _jsx(Loader2, { className: "h-5 w-5 animate-spin text-slate-400" }) })) : (_jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-muted-foreground text-xs", children: "Permissions" }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: userPermissions.length > 0 ? (userPermissions.map((p) => (_jsx("span", { className: "px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs", children: p }, p)))) : (_jsx("span", { className: "text-muted-foreground text-sm", children: "None" })) })] }), hrbacEnabled && (_jsxs("div", { children: [_jsx(Label, { className: "text-muted-foreground text-xs", children: "Assigned Scopes" }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: userScopes.length > 0 ? (userScopes.map((s) => (_jsx("span", { className: "px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs", title: `${SCOPE_LEVEL_LABELS[s.scope_type]}: ${s.scope_seq}`, children: s.scope_seq }, `${s.scope_type}-${s.scope_id}`)))) : (_jsx("span", { className: "text-muted-foreground text-sm", children: "None" })) })] }))] }))] }))] })] }), _jsxs(Tabs, { defaultValue: "rbac", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsxs(TabsTrigger, { value: "rbac", className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-4 w-4" }), "RBAC Test"] }), _jsxs(TabsTrigger, { value: "hrbac", className: "flex items-center gap-2", disabled: !hrbacEnabled, children: [_jsx(FolderTree, { className: "h-4 w-4" }), "HRBAC Test ", !hrbacEnabled && "(Disabled)"] })] }), _jsxs(TabsContent, { value: "rbac", className: "flex flex-col gap-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-lg", children: "Permission Test" }), _jsx(CardDescription, { children: "Select permissions to test if the selected user has them" })] }), _jsxs(CardContent, { className: "flex flex-col gap-4", children: [permissionsLoading ? (_jsx("div", { className: "flex items-center justify-center p-4", children: _jsx(Loader2, { className: "h-5 w-5 animate-spin text-slate-400" }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[300px] overflow-auto p-2 border rounded", children: availablePermissions.map((perm) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { id: `rbac_${perm.permission_name}`, checked: selectedPermissions.includes(perm.permission_name), onCheckedChange: (checked) => handlePermissionToggle(perm.permission_name, checked) }), _jsxs("label", { htmlFor: `rbac_${perm.permission_name}`, className: "text-sm cursor-pointer flex-1", children: [perm.permission_name, userPermissions.includes(perm.permission_name) && (_jsx(CheckCircle, { className: "inline h-3 w-3 text-green-500 ml-1" }))] })] }, perm.permission_name))) })), _jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsxs("span", { children: ["Selected: ", selectedPermissions.length, " permission(s)"] }), selectedPermissions.length > 0 && (_jsxs("span", { className: "text-xs", children: ["(", selectedPermissions.join(", "), ")"] }))] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: handleRunRbacTest, disabled: rbacTesting || !selectedUserId, children: rbacTesting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Testing..."] })) : (_jsxs(_Fragment, { children: [_jsx(Play, { className: "h-4 w-4 mr-2" }), "Test Permissions"] })) }), _jsx(Button, { onClick: handleClearRbac, variant: "outline", children: "Clear" })] })] })] }), rbacResult && (_jsxs(Card, { className: rbacResult.permission_ok
                                    ? "border-green-200 bg-green-50/50"
                                    : "border-red-200 bg-red-50/50", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg flex items-center gap-2", children: rbacResult.permission_ok ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500" }), _jsx("span", { className: "text-green-700", children: "Permission Check Passed" })] })) : (_jsxs(_Fragment, { children: [_jsx(XCircle, { className: "h-5 w-5 text-red-500" }), _jsx("span", { className: "text-red-700", children: "Permission Check Failed" })] })) }) }), _jsxs(CardContent, { className: "flex flex-col gap-3", children: [rbacResult.error && (_jsx("div", { className: "bg-red-100 border border-red-200 rounded p-3", children: _jsx("p", { className: "text-red-700 text-sm", children: rbacResult.error }) })), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-muted-foreground text-xs", children: "Authenticated" }), _jsx("p", { className: `text-sm font-medium ${rbacResult.authenticated ? "text-green-600" : "text-red-600"}`, children: rbacResult.authenticated ? "Yes" : "No" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-muted-foreground text-xs", children: "Permission OK" }), _jsx("p", { className: `text-sm font-medium ${rbacResult.permission_ok ? "text-green-600" : "text-red-600"}`, children: rbacResult.permission_ok ? "Yes" : "No" })] })] }), rbacResult.missing_permissions && rbacResult.missing_permissions.length > 0 && (_jsxs("div", { children: [_jsx(Label, { className: "text-muted-foreground text-xs", children: "Missing Permissions" }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: rbacResult.missing_permissions.map((p) => (_jsx("span", { className: "px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs", children: p }, p))) })] }))] })] }))] }), _jsx(TabsContent, { value: "hrbac", className: "flex flex-col gap-4", children: !hrbacEnabled ? (_jsx(Card, { children: _jsxs(CardContent, { className: "flex flex-col items-center justify-center p-8 gap-4", children: [_jsx(AlertCircle, { className: "h-12 w-12 text-amber-500" }), _jsx("h2", { className: "text-lg font-semibold", children: "HRBAC Not Enabled" }), _jsxs("p", { className: "text-muted-foreground text-center max-w-md", children: ["Enable HRBAC by setting", " ", _jsx("code", { className: "bg-muted px-1 py-0.5 rounded", children: "enable_hrbac = true" }), " in the", " ", _jsx("code", { className: "bg-muted px-1 py-0.5 rounded", children: "[hazo_auth__scope_hierarchy]" }), " ", "section."] })] }) })) : (_jsxs(_Fragment, { children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-lg flex items-center justify-between", children: [_jsx("span", { children: "Scope Access Test" }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => void loadScopeTree(), disabled: treeLoading, children: [_jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${treeLoading ? "animate-spin" : ""}` }), "Refresh"] })] }), _jsx(CardDescription, { children: "Select a scope from the tree and test if the selected user has access" })] }), _jsxs(CardContent, { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { children: "Select Scope" }), treeLoading ? (_jsx("div", { className: "flex items-center justify-center p-8 border rounded-lg", children: _jsx(Loader2, { className: "h-6 w-6 animate-spin text-slate-400" }) })) : scopeTree.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center p-6 border rounded-lg border-dashed", children: [_jsx(FolderTree, { className: "h-8 w-8 text-muted-foreground mb-2" }), _jsx("p", { className: "text-sm text-muted-foreground text-center", children: "No scopes available. Create scopes in User Management first." })] })) : (_jsx("div", { className: "border rounded-lg max-h-[250px] overflow-auto", children: _jsx(TreeView, { data: treeData, expandAll: true, defaultNodeIcon: Building2, defaultLeafIcon: Building2, onSelectChange: handleTreeSelectChange, initialSelectedItemId: selectedTreeItem === null || selectedTreeItem === void 0 ? void 0 : selectedTreeItem.id, className: "w-full" }) }))] }), (selectedTreeItem === null || selectedTreeItem === void 0 ? void 0 : selectedTreeItem.scopeData) && (_jsxs("div", { className: "p-3 border rounded-lg bg-muted/50", children: [_jsxs("p", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Selected:" }), " ", selectedTreeItem.scopeData.name] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [SCOPE_LEVEL_LABELS[selectedTreeItem.scopeData.level], " -", " ", selectedTreeItem.scopeData.seq] })] })), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { children: "Additional Permissions (Optional)" }), permissionsLoading ? (_jsx("div", { className: "flex items-center justify-center p-4", children: _jsx(Loader2, { className: "h-5 w-5 animate-spin text-slate-400" }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[150px] overflow-auto p-2 border rounded", children: availablePermissions.map((perm) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { id: `hrbac_${perm.permission_name}`, checked: hrbacPermissions.includes(perm.permission_name), onCheckedChange: (checked) => handleHrbacPermissionToggle(perm.permission_name, checked) }), _jsx("label", { htmlFor: `hrbac_${perm.permission_name}`, className: "text-sm cursor-pointer flex-1", children: perm.permission_name })] }, perm.permission_name))) }))] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: handleRunHrbacTest, disabled: hrbacTesting || !selectedUserId || !(selectedTreeItem === null || selectedTreeItem === void 0 ? void 0 : selectedTreeItem.scopeData), children: hrbacTesting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Testing..."] })) : (_jsxs(_Fragment, { children: [_jsx(Play, { className: "h-4 w-4 mr-2" }), "Test Scope Access"] })) }), _jsx(Button, { onClick: handleClearHrbac, variant: "outline", children: "Clear" })] })] })] }), hrbacResult && (_jsxs(Card, { className: hrbacResult.scope_ok
                                        ? "border-green-200 bg-green-50/50"
                                        : "border-red-200 bg-red-50/50", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg flex items-center gap-2", children: hrbacResult.scope_ok ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-500" }), _jsx("span", { className: "text-green-700", children: "Scope Access Granted" })] })) : (_jsxs(_Fragment, { children: [_jsx(XCircle, { className: "h-5 w-5 text-red-500" }), _jsx("span", { className: "text-red-700", children: "Scope Access Denied" })] })) }) }), _jsxs(CardContent, { className: "flex flex-col gap-3", children: [hrbacResult.error && (_jsx("div", { className: "bg-red-100 border border-red-200 rounded p-3", children: _jsx("p", { className: "text-red-700 text-sm", children: hrbacResult.error }) })), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-muted-foreground text-xs", children: "Authenticated" }), _jsx("p", { className: `text-sm font-medium ${hrbacResult.authenticated ? "text-green-600" : "text-red-600"}`, children: hrbacResult.authenticated ? "Yes" : "No" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-muted-foreground text-xs", children: "Permission OK" }), _jsx("p", { className: `text-sm font-medium ${hrbacResult.permission_ok ? "text-green-600" : "text-red-600"}`, children: hrbacResult.permission_ok ? "Yes" : "No" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-muted-foreground text-xs", children: "Scope OK" }), _jsx("p", { className: `text-sm font-medium ${hrbacResult.scope_ok === undefined
                                                                        ? "text-muted-foreground"
                                                                        : hrbacResult.scope_ok
                                                                            ? "text-green-600"
                                                                            : "text-red-600"}`, children: hrbacResult.scope_ok === undefined
                                                                        ? "N/A"
                                                                        : hrbacResult.scope_ok
                                                                            ? "Yes"
                                                                            : "No" })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-muted-foreground text-xs", children: "Access Via" }), _jsx("p", { className: "text-sm", children: hrbacResult.scope_access_via
                                                                        ? `${hrbacResult.scope_access_via.scope_seq}`
                                                                        : "N/A" })] })] }), hrbacResult.scope_access_via && (_jsx("div", { className: "bg-green-100 border border-green-200 rounded p-3", children: _jsxs("p", { className: "text-green-700 text-sm", children: ["Access granted via scope:", " ", _jsx("strong", { children: hrbacResult.scope_access_via.scope_seq }), " (", hrbacResult.scope_access_via.scope_type, ")"] }) })), hrbacResult.missing_permissions &&
                                                    hrbacResult.missing_permissions.length > 0 && (_jsxs("div", { children: [_jsx(Label, { className: "text-muted-foreground text-xs", children: "Missing Permissions" }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: hrbacResult.missing_permissions.map((p) => (_jsx("span", { className: "px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs", children: p }, p))) })] })), _jsxs("details", { className: "text-sm", children: [_jsx("summary", { className: "cursor-pointer text-muted-foreground hover:text-foreground", children: "Show raw response" }), _jsx("pre", { className: "mt-2 bg-muted p-3 rounded text-xs overflow-auto", children: JSON.stringify(hrbacResult, null, 2) })] })] })] }))] })) })] })] }));
}
