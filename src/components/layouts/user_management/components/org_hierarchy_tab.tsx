// file_description: Organization Hierarchy tab component for managing multi-tenancy organizations using tree view
// section: client_directive
"use client";

// section: imports
import { useState, useEffect, useCallback, useMemo } from "react";
import { TreeView, type TreeDataItem } from "../../../ui/tree-view";
import { Button } from "../../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  CircleCheck,
  CircleX,
  Building2,
  FolderTree,
  RefreshCw,
  Users,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider";

// section: types
export type OrgHierarchyTabProps = {
  className?: string;
  /** Whether the user has global admin permission (can see all orgs) */
  isGlobalAdmin?: boolean;
};

type OrgRecord = {
  id: string;
  name: string;
  user_limit: number;
  parent_org_id: string | null;
  root_org_id: string | null;
  active: boolean;
  current_user_count?: number;
};

type OrgTreeNode = OrgRecord & {
  children?: OrgTreeNode[];
};

type ExtendedTreeDataItem = TreeDataItem & {
  orgData?: OrgTreeNode;
};

// section: helpers
function getUserCountDisplay(org: OrgTreeNode): string {
  const count = org.current_user_count ?? 0;
  if (org.user_limit === 0) {
    return `${count} users`;
  }
  return `${count}/${org.user_limit} users`;
}

// Convert OrgTreeNode to TreeDataItem format
function convertToTreeData(
  nodes: OrgTreeNode[],
  onEdit: (node: OrgTreeNode) => void,
  onDelete: (node: OrgTreeNode) => void,
  onAddChild: (node: OrgTreeNode) => void
): ExtendedTreeDataItem[] {
  return nodes.map((node) => {
    const hasChildren = node.children && node.children.length > 0;
    const isInactive = node.active === false;

    // Build display name with user count and status
    const displayName = isInactive
      ? `${node.name} (${getUserCountDisplay(node)}) [Inactive]`
      : `${node.name} (${getUserCountDisplay(node)})`;

    const item: ExtendedTreeDataItem = {
      id: node.id,
      name: displayName,
      icon: Building2,
      orgData: node,
      className: isInactive ? "text-muted-foreground line-through" : undefined,
      actions: (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(node);
            }}
            title="Add child organization"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
            }}
            title="Edit organization"
          >
            <Edit className="h-3 w-3" />
          </Button>
          {node.active !== false && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node);
              }}
              title="Deactivate organization"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      ),
    };

    if (hasChildren) {
      item.children = convertToTreeData(
        node.children!,
        onEdit,
        onDelete,
        onAddChild
      );
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
export function OrgHierarchyTab({
  className,
  isGlobalAdmin = false,
}: OrgHierarchyTabProps) {
  const { apiBasePath } = useHazoAuthConfig();

  // State
  const [tree, setTree] = useState<OrgTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExtendedTreeDataItem>();
  const [showInactive, setShowInactive] = useState(false);

  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrgTreeNode | null>(null);
  const [addParentOrg, setAddParentOrg] = useState<OrgTreeNode | null>(null);

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
      const response = await fetch(
        `${apiBasePath}/org_management/orgs?${params}`
      );
      const data = await response.json();

      if (data.success) {
        setTree(data.tree || []);
      } else {
        if (data.code === "MULTI_TENANCY_DISABLED") {
          toast.error("Multi-tenancy is not enabled");
        } else {
          toast.error(data.error || "Failed to load organization hierarchy");
        }
        setTree([]);
      }
    } catch (error) {
      toast.error("Failed to load organization hierarchy");
      setTree([]);
    } finally {
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
  const handleAddChildOrg = (parent: OrgTreeNode) => {
    setAddParentOrg(parent);
    setNewName("");
    setNewUserLimit(0);
    setAddDialogOpen(true);
  };

  // Handle edit org
  const openEditDialog = (org: OrgTreeNode) => {
    setSelectedOrg(org);
    setEditName(org.name);
    setEditUserLimit(org.user_limit || 0);
    setEditDialogOpen(true);
  };

  // Handle delete org
  const openDeleteDialog = (org: OrgTreeNode) => {
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
      const body: Record<string, unknown> = {
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
      } else {
        toast.error(data.error || "Failed to create organization");
      }
    } catch (error) {
      toast.error("Failed to create organization");
    } finally {
      setActionLoading(false);
    }
  };

  // Update org
  const handleUpdateOrg = async () => {
    if (!selectedOrg) return;

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
      } else {
        toast.error(data.error || "Failed to update organization");
      }
    } catch (error) {
      toast.error("Failed to update organization");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete (deactivate) org
  const handleDeleteOrg = async () => {
    if (!selectedOrg) return;

    setActionLoading(true);
    try {
      const params = new URLSearchParams({
        org_id: selectedOrg.id,
      });

      const response = await fetch(
        `${apiBasePath}/org_management/orgs?${params}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Organization deactivated successfully");
        setDeleteDialogOpen(false);
        setSelectedOrg(null);
        await loadTree();
      } else {
        toast.error(data.error || "Failed to deactivate organization");
      }
    } catch (error) {
      toast.error("Failed to deactivate organization");
    } finally {
      setActionLoading(false);
    }
  };

  // Convert tree to TreeDataItem format
  const treeData = useMemo(() => {
    return convertToTreeData(
      tree,
      openEditDialog,
      openDeleteDialog,
      handleAddChildOrg
    );
  }, [tree]);

  // Handle tree item selection
  const handleSelectChange = (item: TreeDataItem | undefined) => {
    setSelectedItem(item as ExtendedTreeDataItem | undefined);
  };

  return (
    <div
      className={`cls_org_hierarchy_tab flex flex-col gap-4 w-full ${className || ""}`}
    >
      {/* Header */}
      <div className="cls_org_hierarchy_header flex items-center justify-between gap-4 flex-wrap">
        <div className="cls_org_hierarchy_header_left flex items-center gap-4">
          {/* Show inactive toggle */}
          <div className="cls_org_hierarchy_inactive_toggle flex items-center gap-2">
            <input
              type="checkbox"
              id="show_inactive"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="show_inactive" className="text-sm font-medium cursor-pointer">
              Show inactive
            </Label>
          </div>

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadTree()}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <div className="cls_org_hierarchy_header_right">
          {isGlobalAdmin && (
            <Button
              onClick={handleAddRootOrg}
              variant="default"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Root Organization
            </Button>
          )}
        </div>
      </div>

      {/* Tree View */}
      {loading ? (
        <div className="cls_org_hierarchy_loading flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : tree.length === 0 ? (
        <div className="cls_org_hierarchy_empty flex flex-col items-center justify-center p-8 border rounded-lg border-dashed">
          <FolderTree className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center mb-4">
            No organizations found
          </p>
          {isGlobalAdmin && (
            <Button onClick={handleAddRootOrg} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create First Organization
            </Button>
          )}
        </div>
      ) : (
        <div className="cls_org_hierarchy_tree_container border rounded-lg overflow-auto w-full min-h-[300px]">
          <TreeView
            data={treeData}
            expandAll
            defaultNodeIcon={Building2}
            defaultLeafIcon={Building2}
            onSelectChange={handleSelectChange}
            className="w-full"
          />
        </div>
      )}

      {/* Selected org info */}
      {selectedItem?.orgData && (
        <div className="cls_org_hierarchy_selected_info p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium mb-2">Selected Organization</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>{" "}
              {selectedItem.orgData.name}
            </div>
            <div>
              <span className="text-muted-foreground">Users:</span>{" "}
              {getUserCountDisplay(selectedItem.orgData)}
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>{" "}
              {selectedItem.orgData.active === false ? (
                <span className="text-destructive">Inactive</span>
              ) : (
                <span className="text-green-600">Active</span>
              )}
            </div>
            <div>
              <span className="text-muted-foreground">ID:</span>{" "}
              <span className="font-mono text-xs">{selectedItem.orgData.id.slice(0, 8)}...</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Org Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="cls_org_hierarchy_add_dialog">
          <DialogHeader>
            <DialogTitle>
              {addParentOrg
                ? `Add Child Organization to "${addParentOrg.name}"`
                : "Add Root Organization"}
            </DialogTitle>
            <DialogDescription>
              Create a new organization
              {addParentOrg &&
                ` as a child of "${addParentOrg.name}".`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new_org_name">Name *</Label>
              <Input
                id="new_org_name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter organization name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new_org_user_limit">User Limit (0 = unlimited)</Label>
              <Input
                id="new_org_user_limit"
                type="number"
                min={0}
                value={newUserLimit}
                onChange={(e) => setNewUserLimit(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateOrg}
              disabled={actionLoading}
              variant="default"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CircleCheck className="h-4 w-4 mr-2" />
                  Create
                </>
              )}
            </Button>
            <Button onClick={() => setAddDialogOpen(false)} variant="outline">
              <CircleX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Org Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="cls_org_hierarchy_edit_dialog">
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update organization: {selectedOrg?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit_org_name">Name *</Label>
              <Input
                id="edit_org_name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter organization name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit_org_user_limit">User Limit (0 = unlimited)</Label>
              <Input
                id="edit_org_user_limit"
                type="number"
                min={0}
                value={editUserLimit}
                onChange={(e) => setEditUserLimit(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleUpdateOrg}
              disabled={actionLoading}
              variant="default"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CircleCheck className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                setEditDialogOpen(false);
                setSelectedOrg(null);
              }}
              variant="outline"
            >
              <CircleX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete (Deactivate) Org Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Organization</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>
                  Are you sure you want to deactivate &quot;{selectedOrg?.name}&quot;?
                  This will mark the organization as inactive but will not delete it.
                  Users in this organization may lose access.
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleDeleteOrg}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deactivating...
                </>
              ) : (
                "Deactivate"
              )}
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedOrg(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
