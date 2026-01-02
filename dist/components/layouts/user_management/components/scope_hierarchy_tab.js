// file_description: Scope Hierarchy tab component for managing HRBAC scopes using tree view
// Uses unified hazo_scopes table with parent_id hierarchy
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
import { Loader2, Plus, Edit, Trash2, CircleCheck, CircleX, Building2, FolderTree, RefreshCw, Palette, } from "lucide-react";
import { BrandingEditor } from "../../scope_management/components/branding_editor";
import { toast } from "sonner";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider";
import { use_hazo_auth } from "../../shared/hooks/use_hazo_auth";
// section: helpers
// Convert ScopeTreeNode to TreeDataItem format
function convertToTreeData(nodes, onEdit, onDelete, onAddChild, onBranding) {
    return nodes.map((node) => {
        const hasChildren = node.children && node.children.length > 0;
        const isRootScope = node.parent_id === null;
        const item = {
            id: node.id,
            name: `${node.name} (${node.level})`,
            icon: Building2,
            scopeData: node,
            actions: (_jsxs("div", { className: "flex items-center gap-1", children: [isRootScope && (_jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0", onClick: (e) => {
                            e.stopPropagation();
                            onBranding(node);
                        }, title: "Manage branding", children: _jsx(Palette, { className: "h-3 w-3" }) })), _jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0", onClick: (e) => {
                            e.stopPropagation();
                            onAddChild(node);
                        }, title: "Add child scope", children: _jsx(Plus, { className: "h-3 w-3" }) }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0", onClick: (e) => {
                            e.stopPropagation();
                            onEdit(node);
                        }, title: "Edit scope", children: _jsx(Edit, { className: "h-3 w-3" }) }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0 text-destructive hover:text-destructive", onClick: (e) => {
                            e.stopPropagation();
                            onDelete(node);
                        }, title: "Delete scope", children: _jsx(Trash2, { className: "h-3 w-3" }) })] })),
        };
        if (hasChildren) {
            item.children = convertToTreeData(node.children, onEdit, onDelete, onAddChild, onBranding);
        }
        return item;
    });
}
// section: component
/**
 * Scope Hierarchy tab component for managing HRBAC scopes
 * Displays scopes in a tree view for intuitive hierarchy configuration
 * Uses unified hazo_scopes table with parent_id for hierarchy
 * @param props - Component props
 * @returns Scope Hierarchy tab component
 */
export function ScopeHierarchyTab({ className, }) {
    const { apiBasePath } = useHazoAuthConfig();
    const authResult = use_hazo_auth();
    // State
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState();
    // Dialog state
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [brandingDialogOpen, setBrandingDialogOpen] = useState(false);
    const [selectedScope, setSelectedScope] = useState(null);
    const [addParentScope, setAddParentScope] = useState(null);
    const [brandingScope, setBrandingScope] = useState(null);
    // Form state
    const [newName, setNewName] = useState("");
    const [newLevel, setNewLevel] = useState("");
    const [editName, setEditName] = useState("");
    const [editLevel, setEditLevel] = useState("");
    // Load tree data
    const loadTree = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ action: "tree" });
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
    }, [apiBasePath]);
    // Load data when auth finishes loading
    useEffect(() => {
        if (!authResult.loading) {
            void loadTree();
        }
    }, [loadTree, authResult.loading]);
    // Handle add scope (root level)
    const handleAddRootScope = () => {
        setAddParentScope(null);
        setNewName("");
        setNewLevel("HQ");
        setAddDialogOpen(true);
    };
    // Handle add child scope
    const handleAddChildScope = (parent) => {
        setAddParentScope(parent);
        setNewName("");
        setNewLevel("Department");
        setAddDialogOpen(true);
    };
    // Handle edit scope
    const openEditDialog = (scope) => {
        setSelectedScope(scope);
        setEditName(scope.name);
        setEditLevel(scope.level);
        setEditDialogOpen(true);
    };
    // Handle delete scope
    const openDeleteDialog = (scope) => {
        setSelectedScope(scope);
        setDeleteDialogOpen(true);
    };
    // Handle branding
    const openBrandingDialog = (scope) => {
        setBrandingScope(scope);
        setBrandingDialogOpen(true);
    };
    // Close branding dialog
    const closeBrandingDialog = () => {
        setBrandingDialogOpen(false);
        setBrandingScope(null);
    };
    // Create scope
    const handleCreateScope = async () => {
        if (!newName.trim()) {
            toast.error("Name is required");
            return;
        }
        if (!newLevel.trim()) {
            toast.error("Level is required");
            return;
        }
        setActionLoading(true);
        try {
            const body = {
                name: newName.trim(),
                level: newLevel.trim(),
                parent_id: (addParentScope === null || addParentScope === void 0 ? void 0 : addParentScope.id) || null,
            };
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
                setNewLevel("");
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
        if (!editLevel.trim()) {
            toast.error("Level is required");
            return;
        }
        setActionLoading(true);
        try {
            const body = {
                scope_id: selectedScope.id,
                name: editName.trim(),
                level: editLevel.trim(),
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
                setEditLevel("");
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
        return convertToTreeData(tree, openEditDialog, openDeleteDialog, handleAddChildScope, openBrandingDialog);
    }, [tree]);
    // Handle tree item selection
    const handleSelectChange = (item) => {
        setSelectedItem(item);
    };
    return (_jsxs("div", { className: `cls_scope_hierarchy_tab flex flex-col gap-4 w-full ${className || ""}`, children: [_jsxs("div", { className: "cls_scope_hierarchy_header flex items-center justify-between gap-4 flex-wrap", children: [_jsx("div", { className: "cls_scope_hierarchy_header_left flex items-center gap-4", children: _jsxs(Button, { variant: "outline", size: "sm", onClick: () => void loadTree(), disabled: loading, children: [_jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}` }), "Refresh"] }) }), _jsx("div", { className: "cls_scope_hierarchy_header_right", children: _jsxs(Button, { onClick: handleAddRootScope, variant: "default", size: "sm", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Root Scope"] }) })] }), loading || authResult.loading ? (_jsx("div", { className: "cls_scope_hierarchy_loading flex items-center justify-center p-8", children: _jsx(Loader2, { className: "h-6 w-6 animate-spin text-slate-400" }) })) : tree.length === 0 ? (_jsxs("div", { className: "cls_scope_hierarchy_empty flex flex-col items-center justify-center p-8 border rounded-lg border-dashed", children: [_jsx(FolderTree, { className: "h-12 w-12 text-muted-foreground mb-4" }), _jsx("p", { className: "text-muted-foreground text-center mb-4", children: "No scopes found. Create a root scope to get started." }), _jsxs(Button, { onClick: handleAddRootScope, variant: "outline", size: "sm", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create First Scope"] })] })) : (_jsx("div", { className: "cls_scope_hierarchy_tree_container border rounded-lg overflow-auto w-full min-h-[300px]", children: _jsx(TreeView, { data: treeData, expandAll: true, defaultNodeIcon: Building2, defaultLeafIcon: Building2, onSelectChange: handleSelectChange, className: "w-full" }) })), (selectedItem === null || selectedItem === void 0 ? void 0 : selectedItem.scopeData) && (_jsxs("div", { className: "cls_scope_hierarchy_selected_info p-4 border rounded-lg bg-muted/50", children: [_jsx("h4", { className: "font-medium mb-2", children: "Selected Scope" }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Name:" }), " ", selectedItem.scopeData.name] }), _jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Level:" }), " ", selectedItem.scopeData.level] }), _jsxs("div", { className: "col-span-2", children: [_jsx("span", { className: "text-muted-foreground", children: "ID:" }), " ", _jsx("span", { className: "font-mono text-xs", children: selectedItem.scopeData.id })] }), selectedItem.scopeData.parent_id && (_jsxs("div", { className: "col-span-2", children: [_jsx("span", { className: "text-muted-foreground", children: "Parent ID:" }), " ", _jsx("span", { className: "font-mono text-xs", children: selectedItem.scopeData.parent_id })] }))] })] })), _jsx(Dialog, { open: addDialogOpen, onOpenChange: setAddDialogOpen, children: _jsxs(DialogContent, { className: "cls_scope_hierarchy_add_dialog", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: addParentScope
                                        ? `Add Child Scope to "${addParentScope.name}"`
                                        : "Add Root Scope" }), _jsx(DialogDescription, { children: addParentScope
                                        ? `Create a new scope under "${addParentScope.name}".`
                                        : "Create a new root-level scope." })] }), _jsxs("div", { className: "flex flex-col gap-4 py-4", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { htmlFor: "new_scope_name", children: "Name *" }), _jsx(Input, { id: "new_scope_name", value: newName, onChange: (e) => setNewName(e.target.value), placeholder: "e.g., Sydney Office" })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { htmlFor: "new_scope_level", children: "Level Label *" }), _jsx(Input, { id: "new_scope_level", value: newLevel, onChange: (e) => setNewLevel(e.target.value), placeholder: "e.g., HQ, Division, Department, Branch" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "A descriptive label for this hierarchy level (e.g., \"HQ\", \"Division\", \"Department\")" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { onClick: handleCreateScope, disabled: actionLoading, variant: "default", children: actionLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Creating..."] })) : (_jsxs(_Fragment, { children: [_jsx(CircleCheck, { className: "h-4 w-4 mr-2" }), "Create"] })) }), _jsxs(Button, { onClick: () => setAddDialogOpen(false), variant: "outline", children: [_jsx(CircleX, { className: "h-4 w-4 mr-2" }), "Cancel"] })] })] }) }), _jsx(Dialog, { open: editDialogOpen, onOpenChange: setEditDialogOpen, children: _jsxs(DialogContent, { className: "cls_scope_hierarchy_edit_dialog", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Edit Scope" }), _jsxs(DialogDescription, { children: ["Update scope: ", selectedScope === null || selectedScope === void 0 ? void 0 : selectedScope.name] })] }), _jsxs("div", { className: "flex flex-col gap-4 py-4", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { htmlFor: "edit_scope_name", children: "Name *" }), _jsx(Input, { id: "edit_scope_name", value: editName, onChange: (e) => setEditName(e.target.value), placeholder: "Enter scope name" })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { htmlFor: "edit_scope_level", children: "Level Label *" }), _jsx(Input, { id: "edit_scope_level", value: editLevel, onChange: (e) => setEditLevel(e.target.value), placeholder: "e.g., HQ, Division, Department" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { onClick: handleUpdateScope, disabled: actionLoading, variant: "default", children: actionLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Saving..."] })) : (_jsxs(_Fragment, { children: [_jsx(CircleCheck, { className: "h-4 w-4 mr-2" }), "Save"] })) }), _jsxs(Button, { onClick: () => {
                                        setEditDialogOpen(false);
                                        setSelectedScope(null);
                                    }, variant: "outline", children: [_jsx(CircleX, { className: "h-4 w-4 mr-2" }), "Cancel"] })] })] }) }), _jsx(AlertDialog, { open: deleteDialogOpen, onOpenChange: setDeleteDialogOpen, children: _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Delete Scope" }), _jsxs(AlertDialogDescription, { children: ["Are you sure you want to delete \"", selectedScope === null || selectedScope === void 0 ? void 0 : selectedScope.name, "\"? This action cannot be undone and will also delete all child scopes."] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogAction, { onClick: handleDeleteScope, disabled: actionLoading, children: actionLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Deleting..."] })) : ("Delete") }), _jsx(AlertDialogCancel, { onClick: () => {
                                        setDeleteDialogOpen(false);
                                        setSelectedScope(null);
                                    }, children: "Cancel" })] })] }) }), brandingScope && (_jsx(BrandingEditor, { scopeId: brandingScope.id, scopeName: brandingScope.name, isOpen: brandingDialogOpen, onClose: closeBrandingDialog }))] }));
}
