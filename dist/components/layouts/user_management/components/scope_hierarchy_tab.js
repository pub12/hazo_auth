// file_description: Scope Hierarchy tab component for managing HRBAC scopes (L1-L7) using tree view
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// section: imports
import { useState, useEffect, useCallback, useMemo } from "react";
import { TreeView } from "../../../ui/tree-view";
import { Button } from "../../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "../../../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "../../../ui/alert-dialog";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Loader2, Plus, Edit, Trash2, CircleCheck, CircleX, Building2, FolderTree, RefreshCw, } from "lucide-react";
import { toast } from "sonner";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider";
import { use_hazo_auth } from "../../shared/hooks/use_hazo_auth";
const SCOPE_LEVEL_LABELS = {
    hazo_scopes_l1: "Level 1",
    hazo_scopes_l2: "Level 2",
    hazo_scopes_l3: "Level 3",
    hazo_scopes_l4: "Level 4",
    hazo_scopes_l5: "Level 5",
    hazo_scopes_l6: "Level 6",
    hazo_scopes_l7: "Level 7",
};
// section: helpers
function getLevelNumber(level) {
    return parseInt(level.replace("hazo_scopes_l", ""));
}
function getChildLevel(level) {
    const num = getLevelNumber(level);
    if (num >= 7)
        return null;
    return `hazo_scopes_l${num + 1}`;
}
// Convert ScopeTreeNode to TreeDataItem format
function convertToTreeData(nodes, onEdit, onDelete, onAddChild) {
    return nodes.map((node) => {
        const levelNum = getLevelNumber(node.level);
        const hasChildren = node.children && node.children.length > 0;
        const canHaveChildren = levelNum < 7;
        const item = {
            id: node.id,
            name: `${node.name} (${node.seq})`,
            icon: Building2,
            scopeData: node,
            actions: (_jsxs("div", { className: "flex items-center gap-1", children: [canHaveChildren && (_jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0", onClick: (e) => {
                            e.stopPropagation();
                            onAddChild(node);
                        }, title: "Add child scope", children: _jsx(Plus, { className: "h-3 w-3" }) })), _jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0", onClick: (e) => {
                            e.stopPropagation();
                            onEdit(node);
                        }, title: "Edit scope", children: _jsx(Edit, { className: "h-3 w-3" }) }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0 text-destructive hover:text-destructive", onClick: (e) => {
                            e.stopPropagation();
                            onDelete(node);
                        }, title: "Delete scope", children: _jsx(Trash2, { className: "h-3 w-3" }) })] })),
        };
        if (hasChildren) {
            item.children = convertToTreeData(node.children, onEdit, onDelete, onAddChild);
        }
        return item;
    });
}
// section: component
/**
 * Scope Hierarchy tab component for managing HRBAC scopes
 * Displays scopes in a tree view for intuitive hierarchy configuration
 * Non-global admins see only their org's scopes (auto-filtered by API)
 * Global admins can view/manage any org's scopes by providing org_id
 * @param props - Component props
 * @returns Scope Hierarchy tab component
 */
export function ScopeHierarchyTab({ className, }) {
    var _a;
    const { apiBasePath } = useHazoAuthConfig();
    const authResult = use_hazo_auth();
    // Determine if user is global admin (can manage any org)
    const isGlobalAdmin = authResult.authenticated && authResult.permissions.includes("hazo_org_global_admin");
    // Get user's org_id (for non-global admins, this is the only org they can manage)
    const userOrgId = ((_a = authResult.user) === null || _a === void 0 ? void 0 : _a.org_id) || "";
    // State
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    // For non-global admins, org_id is fixed to their own org
    // For global admins, they can enter any org_id to view that org's scopes
    const [orgId, setOrgId] = useState("");
    const [selectedItem, setSelectedItem] = useState();
    // Dialog state
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedScope, setSelectedScope] = useState(null);
    const [addParentScope, setAddParentScope] = useState(null);
    // Form state
    const [newName, setNewName] = useState("");
    const [editName, setEditName] = useState("");
    // Initialize orgId from user's org when auth loads
    useEffect(() => {
        if (!authResult.loading && userOrgId && !orgId) {
            setOrgId(userOrgId);
        }
    }, [authResult.loading, userOrgId, orgId]);
    // Load tree data
    const loadTree = useCallback(async () => {
        // For non-global admins, API will auto-filter to their org
        // For global admins, org_id is required to specify which org to view
        if (isGlobalAdmin && !orgId) {
            setTree([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const params = new URLSearchParams({ action: "tree" });
            // Only pass org_id for global admins (non-global admins are auto-filtered by API)
            if (isGlobalAdmin && orgId) {
                params.set("org_id", orgId);
            }
            const response = await fetch(`${apiBasePath}/scope_management/scopes?${params}`);
            const data = await response.json();
            if (data.success) {
                setTree(data.tree || []);
            }
            else {
                toast.error(data.error || "Failed to load scope hierarchy");
                setTree([]);
            }
        }
        catch (error) {
            toast.error("Failed to load scope hierarchy");
            setTree([]);
        }
        finally {
            setLoading(false);
        }
    }, [apiBasePath, orgId, isGlobalAdmin]);
    // Load data when orgId changes or auth finishes loading
    useEffect(() => {
        if (!authResult.loading) {
            void loadTree();
        }
    }, [loadTree, authResult.loading]);
    // Handle add scope (root level)
    const handleAddRootScope = () => {
        setAddParentScope(null);
        setNewName("");
        setAddDialogOpen(true);
    };
    // Handle add child scope
    const handleAddChildScope = (parent) => {
        setAddParentScope(parent);
        setNewName("");
        setAddDialogOpen(true);
    };
    // Handle edit scope
    const openEditDialog = (scope) => {
        setSelectedScope(scope);
        setEditName(scope.name);
        setEditDialogOpen(true);
    };
    // Handle delete scope
    const openDeleteDialog = (scope) => {
        setSelectedScope(scope);
        setDeleteDialogOpen(true);
    };
    // Create scope
    const handleCreateScope = async () => {
        if (!newName.trim()) {
            toast.error("Name is required");
            return;
        }
        setActionLoading(true);
        try {
            const level = addParentScope
                ? getChildLevel(addParentScope.level)
                : "hazo_scopes_l1";
            if (!level) {
                toast.error("Cannot add children to Level 7 scopes");
                return;
            }
            // Build request body - API will use user's org_id for non-global admins
            // or the provided org_id for global admins
            const body = {
                level,
                name: newName.trim(),
            };
            // For global admins, pass the selected org_id
            if (isGlobalAdmin && orgId) {
                body.org_id = orgId;
                body.root_org_id = orgId; // Default root_org_id to same as org_id
            }
            if (addParentScope) {
                body.parent_scope_id = addParentScope.id;
                // Inherit org_id from parent scope
                body.org_id = addParentScope.org_id;
                body.root_org_id = addParentScope.root_org_id;
            }
            const response = await fetch(`${apiBasePath}/scope_management/scopes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Scope created successfully");
                setAddDialogOpen(false);
                setNewName("");
                setAddParentScope(null);
                await loadTree();
            }
            else {
                toast.error(data.error || "Failed to create scope");
            }
        }
        catch (error) {
            toast.error("Failed to create scope");
        }
        finally {
            setActionLoading(false);
        }
    };
    // Update scope
    const handleUpdateScope = async () => {
        if (!selectedScope)
            return;
        if (!editName.trim()) {
            toast.error("Name is required");
            return;
        }
        setActionLoading(true);
        try {
            const body = {
                level: selectedScope.level,
                scope_id: selectedScope.id,
                name: editName.trim(),
            };
            const response = await fetch(`${apiBasePath}/scope_management/scopes`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Scope updated successfully");
                setEditDialogOpen(false);
                setSelectedScope(null);
                setEditName("");
                await loadTree();
            }
            else {
                toast.error(data.error || "Failed to update scope");
            }
        }
        catch (error) {
            toast.error("Failed to update scope");
        }
        finally {
            setActionLoading(false);
        }
    };
    // Delete scope
    const handleDeleteScope = async () => {
        if (!selectedScope)
            return;
        setActionLoading(true);
        try {
            const params = new URLSearchParams({
                level: selectedScope.level,
                scope_id: selectedScope.id,
            });
            const response = await fetch(`${apiBasePath}/scope_management/scopes?${params}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Scope deleted successfully");
                setDeleteDialogOpen(false);
                setSelectedScope(null);
                await loadTree();
            }
            else {
                toast.error(data.error || "Failed to delete scope");
            }
        }
        catch (error) {
            toast.error("Failed to delete scope");
        }
        finally {
            setActionLoading(false);
        }
    };
    // Convert tree to TreeDataItem format
    const treeData = useMemo(() => {
        return convertToTreeData(tree, openEditDialog, openDeleteDialog, handleAddChildScope);
    }, [tree]);
    // Handle tree item selection
    const handleSelectChange = (item) => {
        setSelectedItem(item);
    };
    // Get level label for dialog
    const getAddDialogLevelLabel = () => {
        if (!addParentScope)
            return "Level 1";
        const childLevel = getChildLevel(addParentScope.level);
        return childLevel ? SCOPE_LEVEL_LABELS[childLevel] : "Unknown";
    };
    return (_jsxs("div", { className: `cls_scope_hierarchy_tab flex flex-col gap-4 w-full ${className || ""}`, children: [_jsxs("div", { className: "cls_scope_hierarchy_header flex items-center justify-between gap-4 flex-wrap", children: [_jsxs("div", { className: "cls_scope_hierarchy_header_left flex items-center gap-4", children: [isGlobalAdmin && (_jsxs("div", { className: "cls_scope_hierarchy_org_filter flex items-center gap-2", children: [_jsx(Label, { htmlFor: "scope_org_id", className: "text-sm font-medium", children: "Organization ID:" }), _jsx(Input, { id: "scope_org_id", value: orgId, onChange: (e) => setOrgId(e.target.value), placeholder: "Enter org UUID", className: "w-[280px] font-mono text-sm" })] })), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => void loadTree(), disabled: loading || (isGlobalAdmin && !orgId), children: [_jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}` }), "Refresh"] })] }), _jsx("div", { className: "cls_scope_hierarchy_header_right", children: _jsxs(Button, { onClick: handleAddRootScope, variant: "default", size: "sm", disabled: isGlobalAdmin && !orgId, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Root Scope"] }) })] }), loading || authResult.loading ? (_jsx("div", { className: "cls_scope_hierarchy_loading flex items-center justify-center p-8", children: _jsx(Loader2, { className: "h-6 w-6 animate-spin text-slate-400" }) })) : isGlobalAdmin && !orgId ? (_jsxs("div", { className: "cls_scope_hierarchy_empty flex flex-col items-center justify-center p-8 border rounded-lg border-dashed", children: [_jsx(Building2, { className: "h-12 w-12 text-muted-foreground mb-4" }), _jsx("p", { className: "text-muted-foreground text-center", children: "Enter an organization ID to view scope hierarchy" })] })) : tree.length === 0 ? (_jsxs("div", { className: "cls_scope_hierarchy_empty flex flex-col items-center justify-center p-8 border rounded-lg border-dashed", children: [_jsx(FolderTree, { className: "h-12 w-12 text-muted-foreground mb-4" }), _jsx("p", { className: "text-muted-foreground text-center mb-4", children: "No scopes found for this organization" }), _jsxs(Button, { onClick: handleAddRootScope, variant: "outline", size: "sm", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create First Scope"] })] })) : (_jsx("div", { className: "cls_scope_hierarchy_tree_container border rounded-lg overflow-auto w-full min-h-[300px]", children: _jsx(TreeView, { data: treeData, expandAll: true, defaultNodeIcon: Building2, defaultLeafIcon: Building2, onSelectChange: handleSelectChange, className: "w-full" }) })), (selectedItem === null || selectedItem === void 0 ? void 0 : selectedItem.scopeData) && (_jsxs("div", { className: "cls_scope_hierarchy_selected_info p-4 border rounded-lg bg-muted/50", children: [_jsx("h4", { className: "font-medium mb-2", children: "Selected Scope" }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Name:" }), " ", selectedItem.scopeData.name] }), _jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Seq:" }), " ", selectedItem.scopeData.seq] }), _jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Level:" }), " ", SCOPE_LEVEL_LABELS[selectedItem.scopeData.level]] }), _jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Org ID:" }), " ", _jsx("span", { className: "font-mono text-xs", children: selectedItem.scopeData.org_id })] })] })] })), _jsx(Dialog, { open: addDialogOpen, onOpenChange: setAddDialogOpen, children: _jsxs(DialogContent, { className: "cls_scope_hierarchy_add_dialog", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: addParentScope
                                        ? `Add Child Scope to "${addParentScope.name}"`
                                        : "Add Root Scope" }), _jsxs(DialogDescription, { children: ["Create a new scope at ", getAddDialogLevelLabel(), ".", addParentScope &&
                                            ` This will be a child of "${addParentScope.name}".`] })] }), _jsx("div", { className: "flex flex-col gap-4 py-4", children: _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { htmlFor: "new_scope_name", children: "Name *" }), _jsx(Input, { id: "new_scope_name", value: newName, onChange: (e) => setNewName(e.target.value), placeholder: "Enter scope name" })] }) }), _jsxs(DialogFooter, { children: [_jsx(Button, { onClick: handleCreateScope, disabled: actionLoading, variant: "default", children: actionLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Creating..."] })) : (_jsxs(_Fragment, { children: [_jsx(CircleCheck, { className: "h-4 w-4 mr-2" }), "Create"] })) }), _jsxs(Button, { onClick: () => setAddDialogOpen(false), variant: "outline", children: [_jsx(CircleX, { className: "h-4 w-4 mr-2" }), "Cancel"] })] })] }) }), _jsx(Dialog, { open: editDialogOpen, onOpenChange: setEditDialogOpen, children: _jsxs(DialogContent, { className: "cls_scope_hierarchy_edit_dialog", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Edit Scope" }), _jsxs(DialogDescription, { children: ["Update scope: ", selectedScope === null || selectedScope === void 0 ? void 0 : selectedScope.name, " (", selectedScope === null || selectedScope === void 0 ? void 0 : selectedScope.seq, ")"] })] }), _jsx("div", { className: "flex flex-col gap-4 py-4", children: _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { htmlFor: "edit_scope_name", children: "Name *" }), _jsx(Input, { id: "edit_scope_name", value: editName, onChange: (e) => setEditName(e.target.value), placeholder: "Enter scope name" })] }) }), _jsxs(DialogFooter, { children: [_jsx(Button, { onClick: handleUpdateScope, disabled: actionLoading, variant: "default", children: actionLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Saving..."] })) : (_jsxs(_Fragment, { children: [_jsx(CircleCheck, { className: "h-4 w-4 mr-2" }), "Save"] })) }), _jsxs(Button, { onClick: () => {
                                        setEditDialogOpen(false);
                                        setSelectedScope(null);
                                    }, variant: "outline", children: [_jsx(CircleX, { className: "h-4 w-4 mr-2" }), "Cancel"] })] })] }) }), _jsx(AlertDialog, { open: deleteDialogOpen, onOpenChange: setDeleteDialogOpen, children: _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Delete Scope" }), _jsxs(AlertDialogDescription, { children: ["Are you sure you want to delete \"", selectedScope === null || selectedScope === void 0 ? void 0 : selectedScope.name, "\" (", selectedScope === null || selectedScope === void 0 ? void 0 : selectedScope.seq, ")? This action cannot be undone and will also delete all child scopes."] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogAction, { onClick: handleDeleteScope, disabled: actionLoading, children: actionLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Deleting..."] })) : ("Delete") }), _jsx(AlertDialogCancel, { onClick: () => {
                                        setDeleteDialogOpen(false);
                                        setSelectedScope(null);
                                    }, children: "Cancel" })] })] }) })] }));
}
