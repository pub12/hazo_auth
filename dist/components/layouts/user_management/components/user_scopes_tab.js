// file_description: User Scopes tab component for assigning scopes to users in HRBAC
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// section: imports
import { useState, useEffect, useCallback, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "../../../ui/table";
import { Button } from "../../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "../../../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "../../../ui/alert-dialog";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { TreeView } from "../../../ui/tree-view";
import { Loader2, Plus, Trash2, Search, CircleCheck, CircleX, ChevronRight, Building2, FolderTree, } from "lucide-react";
import { toast } from "sonner";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider";
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
// section: component
/**
 * User Scopes tab component for assigning scopes to users
 * Two-panel layout: Users list | Scope assignments
 * @param props - Component props
 * @returns User Scopes tab component
 */
export function UserScopesTab({ className }) {
    const { apiBasePath } = useHazoAuthConfig();
    // Users state
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [userSearch, setUserSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    // User scopes state
    const [userScopes, setUserScopes] = useState([]);
    const [scopesLoading, setScopesLoading] = useState(false);
    const [inheritedLevels, setInheritedLevels] = useState([]);
    // Add scope dialog state
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [scopeTree, setScopeTree] = useState([]);
    const [treeLoading, setTreeLoading] = useState(false);
    const [selectedTreeItem, setSelectedTreeItem] = useState();
    const [actionLoading, setActionLoading] = useState(false);
    // Delete scope dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [scopeToDelete, setScopeToDelete] = useState(null);
    // Load users
    useEffect(() => {
        const loadUsers = async () => {
            setUsersLoading(true);
            try {
                const response = await fetch(`${apiBasePath}/user_management/users`);
                const data = await response.json();
                if (data.success) {
                    setUsers(data.users || []);
                }
                else {
                    toast.error(data.error || "Failed to load users");
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
    }, [apiBasePath]);
    // Load user scopes when user selected
    const loadUserScopes = useCallback(async () => {
        if (!selectedUser) {
            setUserScopes([]);
            setInheritedLevels([]);
            return;
        }
        setScopesLoading(true);
        try {
            const params = new URLSearchParams({
                user_id: selectedUser.id,
                include_effective: "true",
            });
            const response = await fetch(`${apiBasePath}/user_management/users/scopes?${params}`);
            const data = await response.json();
            if (data.success) {
                setUserScopes(data.direct_scopes || []);
                setInheritedLevels(data.inherited_scope_types || []);
            }
            else {
                toast.error(data.error || "Failed to load user scopes");
            }
        }
        catch (error) {
            toast.error("Failed to load user scopes");
        }
        finally {
            setScopesLoading(false);
        }
    }, [apiBasePath, selectedUser]);
    useEffect(() => {
        void loadUserScopes();
    }, [loadUserScopes]);
    // Load scope tree for add dialog (all scopes across all orgs)
    const loadScopeTree = useCallback(async () => {
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
    }, [apiBasePath]);
    useEffect(() => {
        if (addDialogOpen) {
            void loadScopeTree();
        }
    }, [addDialogOpen, loadScopeTree]);
    // Filter users by search
    const filteredUsers = users.filter((user) => {
        var _a;
        const search = userSearch.toLowerCase();
        return ((((_a = user.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search)) || false) ||
            user.email_address.toLowerCase().includes(search));
    });
    // Get user initials
    const getUserInitials = (user) => {
        var _a, _b;
        if (user.name) {
            const parts = user.name.trim().split(" ");
            if (parts.length >= 2) {
                return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
            }
            return ((_a = user.name[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "";
        }
        return ((_b = user.email_address[0]) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || "?";
    };
    // Convert tree to TreeDataItem format
    const treeData = useMemo(() => {
        return convertToTreeData(scopeTree);
    }, [scopeTree]);
    // Handle tree item selection
    const handleTreeSelectChange = (item) => {
        setSelectedTreeItem(item);
    };
    // Handle add scope
    const handleAddScope = async () => {
        if (!selectedUser || !(selectedTreeItem === null || selectedTreeItem === void 0 ? void 0 : selectedTreeItem.scopeData)) {
            toast.error("Please select a scope from the tree");
            return;
        }
        const scope = selectedTreeItem.scopeData;
        setActionLoading(true);
        try {
            const response = await fetch(`${apiBasePath}/user_management/users/scopes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: selectedUser.id,
                    scope_type: scope.level,
                    scope_id: scope.id,
                    scope_seq: scope.seq,
                }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Scope assigned successfully");
                setAddDialogOpen(false);
                setSelectedTreeItem(undefined);
                await loadUserScopes();
            }
            else {
                toast.error(data.error || "Failed to assign scope");
            }
        }
        catch (error) {
            toast.error("Failed to assign scope");
        }
        finally {
            setActionLoading(false);
        }
    };
    // Handle remove scope
    const handleRemoveScope = async () => {
        if (!selectedUser || !scopeToDelete)
            return;
        setActionLoading(true);
        try {
            const params = new URLSearchParams({
                user_id: selectedUser.id,
                scope_type: scopeToDelete.scope_type,
                scope_id: scopeToDelete.scope_id,
            });
            const response = await fetch(`${apiBasePath}/user_management/users/scopes?${params}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Scope removed successfully");
                setDeleteDialogOpen(false);
                setScopeToDelete(null);
                await loadUserScopes();
            }
            else {
                toast.error(data.error || "Failed to remove scope");
            }
        }
        catch (error) {
            toast.error("Failed to remove scope");
        }
        finally {
            setActionLoading(false);
        }
    };
    // Get level label
    const getLevelLabel = (level) => {
        return SCOPE_LEVEL_LABELS[level] || level;
    };
    return (_jsxs("div", { className: `cls_user_scopes_tab flex flex-col lg:flex-row gap-4 w-full min-h-[500px] ${className || ""}`, children: [_jsxs("div", { className: "cls_user_scopes_users_panel w-full lg:w-1/3 flex flex-col border rounded-lg", children: [_jsxs("div", { className: "cls_user_scopes_users_header p-4 border-b bg-muted/30", children: [_jsx("h3", { className: "font-semibold mb-2", children: "Select User" }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { value: userSearch, onChange: (e) => setUserSearch(e.target.value), placeholder: "Search users...", className: "pl-8" })] })] }), _jsx("div", { className: "cls_user_scopes_users_list flex-1 overflow-auto", children: usersLoading ? (_jsx("div", { className: "flex items-center justify-center p-8", children: _jsx(Loader2, { className: "h-6 w-6 animate-spin text-slate-400" }) })) : filteredUsers.length === 0 ? (_jsx("div", { className: "text-center text-muted-foreground p-8", children: "No users found." })) : (_jsx("div", { className: "divide-y", children: filteredUsers.map((user) => (_jsxs("div", { className: `cls_user_scopes_user_item flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${(selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.id) === user.id ? "bg-muted" : ""}`, onClick: () => setSelectedUser(user), children: [_jsxs(Avatar, { className: "h-8 w-8", children: [_jsx(AvatarImage, { src: user.profile_picture_url || undefined }), _jsx(AvatarFallback, { className: "bg-slate-200 text-slate-600 text-xs", children: getUserInitials(user) })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium truncate", children: user.name || user.email_address }), user.name && (_jsx("p", { className: "text-xs text-muted-foreground truncate", children: user.email_address }))] }), (selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.id) === user.id && (_jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground" }))] }, user.id))) })) })] }), _jsxs("div", { className: "cls_user_scopes_assignments_panel w-full lg:w-2/3 flex flex-col border rounded-lg", children: [_jsxs("div", { className: "cls_user_scopes_assignments_header p-4 border-b bg-muted/30 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: selectedUser
                                            ? `Scopes for ${selectedUser.name || selectedUser.email_address}`
                                            : "Select a user to view scopes" }), selectedUser && inheritedLevels.length > 0 && (_jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: ["Inherits access to: ", inheritedLevels.map(getLevelLabel).join(", ")] }))] }), selectedUser && (_jsxs(Button, { onClick: () => {
                                    setSelectedTreeItem(undefined);
                                    setAddDialogOpen(true);
                                }, variant: "default", size: "sm", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Scope"] }))] }), _jsx("div", { className: "cls_user_scopes_assignments_content flex-1 overflow-auto", children: !selectedUser ? (_jsx("div", { className: "flex items-center justify-center h-full text-muted-foreground", children: "Select a user from the left panel to manage their scope assignments." })) : scopesLoading ? (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsx(Loader2, { className: "h-6 w-6 animate-spin text-slate-400" }) })) : userScopes.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center h-full gap-4 text-muted-foreground", children: [_jsx("p", { children: "No scopes assigned to this user." }), _jsxs(Button, { onClick: () => {
                                        setSelectedTreeItem(undefined);
                                        setAddDialogOpen(true);
                                    }, variant: "outline", size: "sm", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Assign First Scope"] })] })) : (_jsxs(Table, { className: "w-full", children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Level" }), _jsx(TableHead, { children: "Scope Seq" }), _jsx(TableHead, { children: "Scope ID" }), _jsx(TableHead, { children: "Assigned" }), _jsx(TableHead, { className: "text-right w-[80px]", children: "Actions" })] }) }), _jsx(TableBody, { children: userScopes.map((scope) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: getLevelLabel(scope.scope_type) }), _jsx(TableCell, { className: "font-mono text-sm", children: scope.scope_seq }), _jsxs(TableCell, { className: "font-mono text-xs text-muted-foreground", children: [scope.scope_id.substring(0, 8), "..."] }), _jsx(TableCell, { className: "text-sm text-muted-foreground", children: new Date(scope.created_at).toLocaleDateString() }), _jsx(TableCell, { className: "text-right", children: _jsx(Button, { onClick: () => {
                                                        setScopeToDelete(scope);
                                                        setDeleteDialogOpen(true);
                                                    }, variant: "outline", size: "sm", className: "text-destructive", children: _jsx(Trash2, { className: "h-4 w-4" }) }) })] }, `${scope.scope_type}-${scope.scope_id}`))) })] })) })] }), _jsx(Dialog, { open: addDialogOpen, onOpenChange: setAddDialogOpen, children: _jsxs(DialogContent, { className: "cls_user_scopes_add_dialog sm:max-w-[500px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add Scope Assignment" }), _jsxs(DialogDescription, { children: ["Select a scope from the tree to assign to", " ", (selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.name) || (selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.email_address), "."] })] }), _jsxs("div", { className: "flex flex-col gap-4 py-4", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { children: "Select Scope" }), treeLoading ? (_jsx("div", { className: "flex items-center justify-center p-8 border rounded-lg", children: _jsx(Loader2, { className: "h-6 w-6 animate-spin text-slate-400" }) })) : scopeTree.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center p-6 border rounded-lg border-dashed", children: [_jsx(FolderTree, { className: "h-8 w-8 text-muted-foreground mb-2" }), _jsx("p", { className: "text-sm text-muted-foreground text-center", children: "No scopes available. Create scopes in the Scope Hierarchy tab first." })] })) : (_jsx("div", { className: "border rounded-lg max-h-[300px] overflow-auto", children: _jsx(TreeView, { data: treeData, expandAll: true, defaultNodeIcon: Building2, defaultLeafIcon: Building2, onSelectChange: handleTreeSelectChange, initialSelectedItemId: selectedTreeItem === null || selectedTreeItem === void 0 ? void 0 : selectedTreeItem.id, className: "w-full" }) }))] }), (selectedTreeItem === null || selectedTreeItem === void 0 ? void 0 : selectedTreeItem.scopeData) && (_jsxs("div", { className: "p-3 border rounded-lg bg-muted/50", children: [_jsxs("p", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Selected:" }), " ", selectedTreeItem.scopeData.name] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [SCOPE_LEVEL_LABELS[selectedTreeItem.scopeData.level], " -", " ", selectedTreeItem.scopeData.seq, " (", selectedTreeItem.scopeData.org, ")"] })] }))] }), _jsxs(DialogFooter, { children: [_jsx(Button, { onClick: handleAddScope, disabled: actionLoading || !(selectedTreeItem === null || selectedTreeItem === void 0 ? void 0 : selectedTreeItem.scopeData), variant: "default", children: actionLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Assigning..."] })) : (_jsxs(_Fragment, { children: [_jsx(CircleCheck, { className: "h-4 w-4 mr-2" }), "Assign Scope"] })) }), _jsxs(Button, { onClick: () => setAddDialogOpen(false), variant: "outline", children: [_jsx(CircleX, { className: "h-4 w-4 mr-2" }), "Cancel"] })] })] }) }), _jsx(AlertDialog, { open: deleteDialogOpen, onOpenChange: setDeleteDialogOpen, children: _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Remove Scope Assignment" }), _jsxs(AlertDialogDescription, { children: ["Are you sure you want to remove the scope \"", scopeToDelete === null || scopeToDelete === void 0 ? void 0 : scopeToDelete.scope_seq, "\" from", " ", (selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.name) || (selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.email_address), "? This will also revoke access to any inherited scopes."] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogAction, { onClick: handleRemoveScope, disabled: actionLoading, children: actionLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Removing..."] })) : ("Remove") }), _jsx(AlertDialogCancel, { onClick: () => {
                                        setDeleteDialogOpen(false);
                                        setScopeToDelete(null);
                                    }, children: "Cancel" })] })] }) })] }));
}
