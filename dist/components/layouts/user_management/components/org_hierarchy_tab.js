// file_description: Organization Hierarchy tab component for managing multi-tenancy organizations using tree view
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
import { Loader2, Plus, Edit, Trash2, CircleCheck, CircleX, Building2, FolderTree, RefreshCw, AlertCircle, } from "lucide-react";
import { toast } from "sonner";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider";
// section: helpers
function getUserCountDisplay(org) {
    var _a;
    const count = (_a = org.current_user_count) !== null && _a !== void 0 ? _a : 0;
    if (org.user_limit === 0) {
        return `${count} users`;
    }
    return `${count}/${org.user_limit} users`;
}
// Convert OrgTreeNode to TreeDataItem format
function convertToTreeData(nodes, onEdit, onDelete, onAddChild) {
    return nodes.map((node) => {
        const hasChildren = node.children && node.children.length > 0;
        const isInactive = node.active === false;
        // Build display name with user count and status
        const displayName = isInactive
            ? `${node.name} (${getUserCountDisplay(node)}) [Inactive]`
            : `${node.name} (${getUserCountDisplay(node)})`;
        const item = {
            id: node.id,
            name: displayName,
            icon: Building2,
            orgData: node,
            className: isInactive ? "text-muted-foreground line-through" : undefined,
            actions: (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0", onClick: (e) => {
                            e.stopPropagation();
                            onAddChild(node);
                        }, title: "Add child organization", children: _jsx(Plus, { className: "h-3 w-3" }) }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0", onClick: (e) => {
                            e.stopPropagation();
                            onEdit(node);
                        }, title: "Edit organization", children: _jsx(Edit, { className: "h-3 w-3" }) }), node.active !== false && (_jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0 text-destructive hover:text-destructive", onClick: (e) => {
                            e.stopPropagation();
                            onDelete(node);
                        }, title: "Deactivate organization", children: _jsx(Trash2, { className: "h-3 w-3" }) }))] })),
        };
        if (hasChildren) {
            item.children = convertToTreeData(node.children, onEdit, onDelete, onAddChild);
        }
        return item;
    });
}
// section: component
/**
 * Organization Hierarchy tab component for managing multi-tenancy organizations
 * Displays organizations in a tree view for intuitive hierarchy configuration
 * @param props - Component props
 * @returns Organization Hierarchy tab component
 */
export function OrgHierarchyTab({ className, isGlobalAdmin = false, }) {
    const { apiBasePath } = useHazoAuthConfig();
    // State
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState();
    const [showInactive, setShowInactive] = useState(false);
    // Dialog state
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [addParentOrg, setAddParentOrg] = useState(null);
    // Form state
    const [newName, setNewName] = useState("");
    const [newUserLimit, setNewUserLimit] = useState(0);
    const [editName, setEditName] = useState("");
    const [editUserLimit, setEditUserLimit] = useState(0);
    // Load tree data
    const loadTree = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                action: "tree",
                include_inactive: showInactive.toString(),
            });
            const response = await fetch(`${apiBasePath}/org_management/orgs?${params}`);
            const data = await response.json();
            if (data.success) {
                setTree(data.tree || []);
            }
            else {
                if (data.code === "MULTI_TENANCY_DISABLED") {
                    toast.error("Multi-tenancy is not enabled");
                }
                else {
                    toast.error(data.error || "Failed to load organization hierarchy");
                }
                setTree([]);
            }
        }
        catch (error) {
            toast.error("Failed to load organization hierarchy");
            setTree([]);
        }
        finally {
            setLoading(false);
        }
    }, [apiBasePath, showInactive]);
    // Load data on mount and when showInactive changes
    useEffect(() => {
        void loadTree();
    }, [loadTree]);
    // Handle add org (root level) - only for global admins
    const handleAddRootOrg = () => {
        if (!isGlobalAdmin) {
            toast.error("Only global admins can create root organizations");
            return;
        }
        setAddParentOrg(null);
        setNewName("");
        setNewUserLimit(0);
        setAddDialogOpen(true);
    };
    // Handle add child org
    const handleAddChildOrg = (parent) => {
        setAddParentOrg(parent);
        setNewName("");
        setNewUserLimit(0);
        setAddDialogOpen(true);
    };
    // Handle edit org
    const openEditDialog = (org) => {
        setSelectedOrg(org);
        setEditName(org.name);
        setEditUserLimit(org.user_limit || 0);
        setEditDialogOpen(true);
    };
    // Handle delete org
    const openDeleteDialog = (org) => {
        setSelectedOrg(org);
        setDeleteDialogOpen(true);
    };
    // Create org
    const handleCreateOrg = async () => {
        if (!newName.trim()) {
            toast.error("Name is required");
            return;
        }
        setActionLoading(true);
        try {
            const body = {
                name: newName.trim(),
                user_limit: newUserLimit,
            };
            if (addParentOrg) {
                body.parent_org_id = addParentOrg.id;
            }
            const response = await fetch(`${apiBasePath}/org_management/orgs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Organization created successfully");
                setAddDialogOpen(false);
                setNewName("");
                setNewUserLimit(0);
                setAddParentOrg(null);
                await loadTree();
            }
            else {
                toast.error(data.error || "Failed to create organization");
            }
        }
        catch (error) {
            toast.error("Failed to create organization");
        }
        finally {
            setActionLoading(false);
        }
    };
    // Update org
    const handleUpdateOrg = async () => {
        if (!selectedOrg)
            return;
        if (!editName.trim()) {
            toast.error("Name is required");
            return;
        }
        setActionLoading(true);
        try {
            const body = {
                org_id: selectedOrg.id,
                name: editName.trim(),
                user_limit: editUserLimit,
            };
            const response = await fetch(`${apiBasePath}/org_management/orgs`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Organization updated successfully");
                setEditDialogOpen(false);
                setSelectedOrg(null);
                setEditName("");
                setEditUserLimit(0);
                await loadTree();
            }
            else {
                toast.error(data.error || "Failed to update organization");
            }
        }
        catch (error) {
            toast.error("Failed to update organization");
        }
        finally {
            setActionLoading(false);
        }
    };
    // Delete (deactivate) org
    const handleDeleteOrg = async () => {
        if (!selectedOrg)
            return;
        setActionLoading(true);
        try {
            const params = new URLSearchParams({
                org_id: selectedOrg.id,
            });
            const response = await fetch(`${apiBasePath}/org_management/orgs?${params}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Organization deactivated successfully");
                setDeleteDialogOpen(false);
                setSelectedOrg(null);
                await loadTree();
            }
            else {
                toast.error(data.error || "Failed to deactivate organization");
            }
        }
        catch (error) {
            toast.error("Failed to deactivate organization");
        }
        finally {
            setActionLoading(false);
        }
    };
    // Convert tree to TreeDataItem format
    const treeData = useMemo(() => {
        return convertToTreeData(tree, openEditDialog, openDeleteDialog, handleAddChildOrg);
    }, [tree]);
    // Handle tree item selection
    const handleSelectChange = (item) => {
        setSelectedItem(item);
    };
    return (_jsxs("div", { className: `cls_org_hierarchy_tab flex flex-col gap-4 w-full ${className || ""}`, children: [_jsxs("div", { className: "cls_org_hierarchy_header flex items-center justify-between gap-4 flex-wrap", children: [_jsxs("div", { className: "cls_org_hierarchy_header_left flex items-center gap-4", children: [_jsxs("div", { className: "cls_org_hierarchy_inactive_toggle flex items-center gap-2", children: [_jsx("input", { type: "checkbox", id: "show_inactive", checked: showInactive, onChange: (e) => setShowInactive(e.target.checked), className: "h-4 w-4 rounded border-gray-300" }), _jsx(Label, { htmlFor: "show_inactive", className: "text-sm font-medium cursor-pointer", children: "Show inactive" })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => void loadTree(), disabled: loading, children: [_jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}` }), "Refresh"] })] }), _jsx("div", { className: "cls_org_hierarchy_header_right", children: isGlobalAdmin && (_jsxs(Button, { onClick: handleAddRootOrg, variant: "default", size: "sm", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Root Organization"] })) })] }), loading ? (_jsx("div", { className: "cls_org_hierarchy_loading flex items-center justify-center p-8", children: _jsx(Loader2, { className: "h-6 w-6 animate-spin text-slate-400" }) })) : tree.length === 0 ? (_jsxs("div", { className: "cls_org_hierarchy_empty flex flex-col items-center justify-center p-8 border rounded-lg border-dashed", children: [_jsx(FolderTree, { className: "h-12 w-12 text-muted-foreground mb-4" }), _jsx("p", { className: "text-muted-foreground text-center mb-4", children: "No organizations found" }), isGlobalAdmin && (_jsxs(Button, { onClick: handleAddRootOrg, variant: "outline", size: "sm", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create First Organization"] }))] })) : (_jsx("div", { className: "cls_org_hierarchy_tree_container border rounded-lg overflow-auto w-full min-h-[300px]", children: _jsx(TreeView, { data: treeData, expandAll: true, defaultNodeIcon: Building2, defaultLeafIcon: Building2, onSelectChange: handleSelectChange, className: "w-full" }) })), (selectedItem === null || selectedItem === void 0 ? void 0 : selectedItem.orgData) && (_jsxs("div", { className: "cls_org_hierarchy_selected_info p-4 border rounded-lg bg-muted/50", children: [_jsx("h4", { className: "font-medium mb-2", children: "Selected Organization" }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Name:" }), " ", selectedItem.orgData.name] }), _jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Users:" }), " ", getUserCountDisplay(selectedItem.orgData)] }), _jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Status:" }), " ", selectedItem.orgData.active === false ? (_jsx("span", { className: "text-destructive", children: "Inactive" })) : (_jsx("span", { className: "text-green-600", children: "Active" }))] }), _jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "ID:" }), " ", _jsxs("span", { className: "font-mono text-xs", children: [selectedItem.orgData.id.slice(0, 8), "..."] })] })] })] })), _jsx(Dialog, { open: addDialogOpen, onOpenChange: setAddDialogOpen, children: _jsxs(DialogContent, { className: "cls_org_hierarchy_add_dialog", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: addParentOrg
                                        ? `Add Child Organization to "${addParentOrg.name}"`
                                        : "Add Root Organization" }), _jsxs(DialogDescription, { children: ["Create a new organization", addParentOrg &&
                                            ` as a child of "${addParentOrg.name}".`] })] }), _jsxs("div", { className: "flex flex-col gap-4 py-4", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { htmlFor: "new_org_name", children: "Name *" }), _jsx(Input, { id: "new_org_name", value: newName, onChange: (e) => setNewName(e.target.value), placeholder: "Enter organization name" })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { htmlFor: "new_org_user_limit", children: "User Limit (0 = unlimited)" }), _jsx(Input, { id: "new_org_user_limit", type: "number", min: 0, value: newUserLimit, onChange: (e) => setNewUserLimit(parseInt(e.target.value) || 0), placeholder: "0" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { onClick: handleCreateOrg, disabled: actionLoading, variant: "default", children: actionLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Creating..."] })) : (_jsxs(_Fragment, { children: [_jsx(CircleCheck, { className: "h-4 w-4 mr-2" }), "Create"] })) }), _jsxs(Button, { onClick: () => setAddDialogOpen(false), variant: "outline", children: [_jsx(CircleX, { className: "h-4 w-4 mr-2" }), "Cancel"] })] })] }) }), _jsx(Dialog, { open: editDialogOpen, onOpenChange: setEditDialogOpen, children: _jsxs(DialogContent, { className: "cls_org_hierarchy_edit_dialog", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Edit Organization" }), _jsxs(DialogDescription, { children: ["Update organization: ", selectedOrg === null || selectedOrg === void 0 ? void 0 : selectedOrg.name] })] }), _jsxs("div", { className: "flex flex-col gap-4 py-4", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { htmlFor: "edit_org_name", children: "Name *" }), _jsx(Input, { id: "edit_org_name", value: editName, onChange: (e) => setEditName(e.target.value), placeholder: "Enter organization name" })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { htmlFor: "edit_org_user_limit", children: "User Limit (0 = unlimited)" }), _jsx(Input, { id: "edit_org_user_limit", type: "number", min: 0, value: editUserLimit, onChange: (e) => setEditUserLimit(parseInt(e.target.value) || 0), placeholder: "0" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { onClick: handleUpdateOrg, disabled: actionLoading, variant: "default", children: actionLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Saving..."] })) : (_jsxs(_Fragment, { children: [_jsx(CircleCheck, { className: "h-4 w-4 mr-2" }), "Save"] })) }), _jsxs(Button, { onClick: () => {
                                        setEditDialogOpen(false);
                                        setSelectedOrg(null);
                                    }, variant: "outline", children: [_jsx(CircleX, { className: "h-4 w-4 mr-2" }), "Cancel"] })] })] }) }), _jsx(AlertDialog, { open: deleteDialogOpen, onOpenChange: setDeleteDialogOpen, children: _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Deactivate Organization" }), _jsx(AlertDialogDescription, { children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" }), _jsxs("span", { children: ["Are you sure you want to deactivate \"", selectedOrg === null || selectedOrg === void 0 ? void 0 : selectedOrg.name, "\"? This will mark the organization as inactive but will not delete it. Users in this organization may lose access."] })] }) })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogAction, { onClick: handleDeleteOrg, disabled: actionLoading, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: actionLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Deactivating..."] })) : ("Deactivate") }), _jsx(AlertDialogCancel, { onClick: () => {
                                        setDeleteDialogOpen(false);
                                        setSelectedOrg(null);
                                    }, children: "Cancel" })] })] }) })] }));
}
