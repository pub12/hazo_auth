// file_description: Scope Hierarchy tab component for managing HRBAC scopes (L1-L7) using tree view
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
} from "lucide-react";
import { toast } from "sonner";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider";

// section: types
export type ScopeHierarchyTabProps = {
  className?: string;
  defaultOrg?: string;
};

type ScopeLevel =
  | "hazo_scopes_l1"
  | "hazo_scopes_l2"
  | "hazo_scopes_l3"
  | "hazo_scopes_l4"
  | "hazo_scopes_l5"
  | "hazo_scopes_l6"
  | "hazo_scopes_l7";

type ScopeRecord = {
  id: string;
  seq: string;
  org: string;
  name: string;
  parent_scope_id?: string;
  created_at: string;
  changed_at: string;
};

type ScopeTreeNode = ScopeRecord & {
  children?: ScopeTreeNode[];
  level: ScopeLevel;
};

type ExtendedTreeDataItem = TreeDataItem & {
  scopeData?: ScopeTreeNode;
};

const SCOPE_LEVEL_LABELS: Record<ScopeLevel, string> = {
  hazo_scopes_l1: "Level 1",
  hazo_scopes_l2: "Level 2",
  hazo_scopes_l3: "Level 3",
  hazo_scopes_l4: "Level 4",
  hazo_scopes_l5: "Level 5",
  hazo_scopes_l6: "Level 6",
  hazo_scopes_l7: "Level 7",
};

// section: helpers
function getLevelNumber(level: ScopeLevel): number {
  return parseInt(level.replace("hazo_scopes_l", ""));
}

function getChildLevel(level: ScopeLevel): ScopeLevel | null {
  const num = getLevelNumber(level);
  if (num >= 7) return null;
  return `hazo_scopes_l${num + 1}` as ScopeLevel;
}

// Convert ScopeTreeNode to TreeDataItem format
function convertToTreeData(
  nodes: ScopeTreeNode[],
  onEdit: (node: ScopeTreeNode) => void,
  onDelete: (node: ScopeTreeNode) => void,
  onAddChild: (node: ScopeTreeNode) => void
): ExtendedTreeDataItem[] {
  return nodes.map((node) => {
    const levelNum = getLevelNumber(node.level);
    const hasChildren = node.children && node.children.length > 0;
    const canHaveChildren = levelNum < 7;

    const item: ExtendedTreeDataItem = {
      id: node.id,
      name: `${node.name} (${node.seq})`,
      icon: Building2,
      scopeData: node,
      actions: (
        <div className="flex items-center gap-1">
          {canHaveChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node);
              }}
              title="Add child scope"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
            }}
            title="Edit scope"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node);
            }}
            title="Delete scope"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
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
 * Scope Hierarchy tab component for managing HRBAC scopes
 * Displays scopes in a tree view for intuitive hierarchy configuration
 * @param props - Component props
 * @returns Scope Hierarchy tab component
 */
export function ScopeHierarchyTab({
  className,
  defaultOrg = "",
}: ScopeHierarchyTabProps) {
  const { apiBasePath } = useHazoAuthConfig();

  // State
  const [tree, setTree] = useState<ScopeTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [org, setOrg] = useState(defaultOrg);
  const [selectedItem, setSelectedItem] = useState<ExtendedTreeDataItem>();

  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedScope, setSelectedScope] = useState<ScopeTreeNode | null>(
    null
  );
  const [addParentScope, setAddParentScope] = useState<ScopeTreeNode | null>(
    null
  );

  // Form state
  const [newName, setNewName] = useState("");
  const [newOrg, setNewOrg] = useState(defaultOrg);
  const [editName, setEditName] = useState("");

  // Load tree data
  const loadTree = useCallback(async () => {
    if (!org) {
      setTree([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({ action: "tree", org });
      const response = await fetch(
        `${apiBasePath}/scope_management/scopes?${params}`
      );
      const data = await response.json();

      if (data.success) {
        setTree(data.tree || []);
      } else {
        toast.error(data.error || "Failed to load scope hierarchy");
        setTree([]);
      }
    } catch (error) {
      toast.error("Failed to load scope hierarchy");
      setTree([]);
    } finally {
      setLoading(false);
    }
  }, [apiBasePath, org]);

  // Load data when org changes
  useEffect(() => {
    void loadTree();
  }, [loadTree]);

  // Handle add scope (root level)
  const handleAddRootScope = () => {
    setAddParentScope(null);
    setNewOrg(org || defaultOrg);
    setNewName("");
    setAddDialogOpen(true);
  };

  // Handle add child scope
  const handleAddChildScope = (parent: ScopeTreeNode) => {
    setAddParentScope(parent);
    setNewOrg(parent.org);
    setNewName("");
    setAddDialogOpen(true);
  };

  // Handle edit scope
  const openEditDialog = (scope: ScopeTreeNode) => {
    setSelectedScope(scope);
    setEditName(scope.name);
    setEditDialogOpen(true);
  };

  // Handle delete scope
  const openDeleteDialog = (scope: ScopeTreeNode) => {
    setSelectedScope(scope);
    setDeleteDialogOpen(true);
  };

  // Create scope
  const handleCreateScope = async () => {
    if (!newName.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!newOrg.trim()) {
      toast.error("Organization is required");
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

      const body: Record<string, string> = {
        level,
        org: newOrg.trim(),
        name: newName.trim(),
      };

      if (addParentScope) {
        body.parent_scope_id = addParentScope.id;
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
      } else {
        toast.error(data.error || "Failed to create scope");
      }
    } catch (error) {
      toast.error("Failed to create scope");
    } finally {
      setActionLoading(false);
    }
  };

  // Update scope
  const handleUpdateScope = async () => {
    if (!selectedScope) return;

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
      } else {
        toast.error(data.error || "Failed to update scope");
      }
    } catch (error) {
      toast.error("Failed to update scope");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete scope
  const handleDeleteScope = async () => {
    if (!selectedScope) return;

    setActionLoading(true);
    try {
      const params = new URLSearchParams({
        level: selectedScope.level,
        scope_id: selectedScope.id,
      });

      const response = await fetch(
        `${apiBasePath}/scope_management/scopes?${params}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Scope deleted successfully");
        setDeleteDialogOpen(false);
        setSelectedScope(null);
        await loadTree();
      } else {
        toast.error(data.error || "Failed to delete scope");
      }
    } catch (error) {
      toast.error("Failed to delete scope");
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
      handleAddChildScope
    );
  }, [tree]);

  // Handle tree item selection
  const handleSelectChange = (item: TreeDataItem | undefined) => {
    setSelectedItem(item as ExtendedTreeDataItem | undefined);
  };

  // Get level label for dialog
  const getAddDialogLevelLabel = () => {
    if (!addParentScope) return "Level 1";
    const childLevel = getChildLevel(addParentScope.level);
    return childLevel ? SCOPE_LEVEL_LABELS[childLevel] : "Unknown";
  };

  return (
    <div
      className={`cls_scope_hierarchy_tab flex flex-col gap-4 w-full ${className || ""}`}
    >
      {/* Header */}
      <div className="cls_scope_hierarchy_header flex items-center justify-between gap-4 flex-wrap">
        <div className="cls_scope_hierarchy_header_left flex items-center gap-4">
          {/* Org filter */}
          <div className="cls_scope_hierarchy_org_filter flex items-center gap-2">
            <Label htmlFor="scope_org" className="text-sm font-medium">
              Organization:
            </Label>
            <Input
              id="scope_org"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="Enter organization"
              className="w-[200px]"
            />
          </div>

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadTree()}
            disabled={loading || !org}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <div className="cls_scope_hierarchy_header_right">
          <Button
            onClick={handleAddRootScope}
            variant="default"
            size="sm"
            disabled={!org}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Root Scope
          </Button>
        </div>
      </div>

      {/* Tree View */}
      {loading ? (
        <div className="cls_scope_hierarchy_loading flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : !org ? (
        <div className="cls_scope_hierarchy_empty flex flex-col items-center justify-center p-8 border rounded-lg border-dashed">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Enter an organization name to view scope hierarchy
          </p>
        </div>
      ) : tree.length === 0 ? (
        <div className="cls_scope_hierarchy_empty flex flex-col items-center justify-center p-8 border rounded-lg border-dashed">
          <FolderTree className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center mb-4">
            No scopes found for organization &quot;{org}&quot;
          </p>
          <Button onClick={handleAddRootScope} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create First Scope
          </Button>
        </div>
      ) : (
        <div className="cls_scope_hierarchy_tree_container border rounded-lg overflow-auto w-full min-h-[300px]">
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

      {/* Selected scope info */}
      {selectedItem?.scopeData && (
        <div className="cls_scope_hierarchy_selected_info p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium mb-2">Selected Scope</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>{" "}
              {selectedItem.scopeData.name}
            </div>
            <div>
              <span className="text-muted-foreground">Seq:</span>{" "}
              {selectedItem.scopeData.seq}
            </div>
            <div>
              <span className="text-muted-foreground">Level:</span>{" "}
              {SCOPE_LEVEL_LABELS[selectedItem.scopeData.level]}
            </div>
            <div>
              <span className="text-muted-foreground">Org:</span>{" "}
              {selectedItem.scopeData.org}
            </div>
          </div>
        </div>
      )}

      {/* Add Scope Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="cls_scope_hierarchy_add_dialog">
          <DialogHeader>
            <DialogTitle>
              {addParentScope
                ? `Add Child Scope to "${addParentScope.name}"`
                : "Add Root Scope"}
            </DialogTitle>
            <DialogDescription>
              Create a new scope at {getAddDialogLevelLabel()}.
              {addParentScope &&
                ` This will be a child of "${addParentScope.name}".`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new_scope_name">Name *</Label>
              <Input
                id="new_scope_name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter scope name"
              />
            </div>
            {!addParentScope && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="new_scope_org">Organization *</Label>
                <Input
                  id="new_scope_org"
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
                  placeholder="Enter organization"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateScope}
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

      {/* Edit Scope Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="cls_scope_hierarchy_edit_dialog">
          <DialogHeader>
            <DialogTitle>Edit Scope</DialogTitle>
            <DialogDescription>
              Update scope: {selectedScope?.name} ({selectedScope?.seq})
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit_scope_name">Name *</Label>
              <Input
                id="edit_scope_name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter scope name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleUpdateScope}
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
                setSelectedScope(null);
              }}
              variant="outline"
            >
              <CircleX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Scope Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scope</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedScope?.name}&quot;
              ({selectedScope?.seq})? This action cannot be undone and will also
              delete all child scopes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleDeleteScope}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedScope(null);
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
