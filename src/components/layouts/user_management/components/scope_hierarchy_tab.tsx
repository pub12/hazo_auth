// file_description: Scope Hierarchy tab component for managing HRBAC scopes using tree view
// Uses unified hazo_scopes table with parent_id hierarchy
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
import { use_hazo_auth } from "../../shared/hooks/use_hazo_auth";

// section: types
export type ScopeHierarchyTabProps = {
  className?: string;
};

type ScopeRecord = {
  id: string;
  name: string;
  level: string; // Descriptive label (e.g., "HQ", "Division", "Department")
  parent_id: string | null;
  created_at: string;
  changed_at: string;
};

type ScopeTreeNode = ScopeRecord & {
  children?: ScopeTreeNode[];
};

type ExtendedTreeDataItem = TreeDataItem & {
  scopeData?: ScopeTreeNode;
};

// section: helpers
// Convert ScopeTreeNode to TreeDataItem format
function convertToTreeData(
  nodes: ScopeTreeNode[],
  onEdit: (node: ScopeTreeNode) => void,
  onDelete: (node: ScopeTreeNode) => void,
  onAddChild: (node: ScopeTreeNode) => void
): ExtendedTreeDataItem[] {
  return nodes.map((node) => {
    const hasChildren = node.children && node.children.length > 0;

    const item: ExtendedTreeDataItem = {
      id: node.id,
      name: `${node.name} (${node.level})`,
      icon: Building2,
      scopeData: node,
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
            title="Add child scope"
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
 * Uses unified hazo_scopes table with parent_id for hierarchy
 * @param props - Component props
 * @returns Scope Hierarchy tab component
 */
export function ScopeHierarchyTab({
  className,
}: ScopeHierarchyTabProps) {
  const { apiBasePath } = useHazoAuthConfig();
  const authResult = use_hazo_auth();

  // State
  const [tree, setTree] = useState<ScopeTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExtendedTreeDataItem>();

  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedScope, setSelectedScope] = useState<ScopeTreeNode | null>(null);
  const [addParentScope, setAddParentScope] = useState<ScopeTreeNode | null>(null);

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
  const handleAddChildScope = (parent: ScopeTreeNode) => {
    setAddParentScope(parent);
    setNewName("");
    setNewLevel("Department");
    setAddDialogOpen(true);
  };

  // Handle edit scope
  const openEditDialog = (scope: ScopeTreeNode) => {
    setSelectedScope(scope);
    setEditName(scope.name);
    setEditLevel(scope.level);
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

    if (!newLevel.trim()) {
      toast.error("Level is required");
      return;
    }

    setActionLoading(true);
    try {
      const body: Record<string, string | null> = {
        name: newName.trim(),
        level: newLevel.trim(),
        parent_id: addParentScope?.id || null,
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

  return (
    <div
      className={`cls_scope_hierarchy_tab flex flex-col gap-4 w-full ${className || ""}`}
    >
      {/* Header */}
      <div className="cls_scope_hierarchy_header flex items-center justify-between gap-4 flex-wrap">
        <div className="cls_scope_hierarchy_header_left flex items-center gap-4">
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

        <div className="cls_scope_hierarchy_header_right">
          <Button
            onClick={handleAddRootScope}
            variant="default"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Root Scope
          </Button>
        </div>
      </div>

      {/* Tree View */}
      {loading || authResult.loading ? (
        <div className="cls_scope_hierarchy_loading flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : tree.length === 0 ? (
        <div className="cls_scope_hierarchy_empty flex flex-col items-center justify-center p-8 border rounded-lg border-dashed">
          <FolderTree className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center mb-4">
            No scopes found. Create a root scope to get started.
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
              <span className="text-muted-foreground">Level:</span>{" "}
              {selectedItem.scopeData.level}
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">ID:</span>{" "}
              <span className="font-mono text-xs">{selectedItem.scopeData.id}</span>
            </div>
            {selectedItem.scopeData.parent_id && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Parent ID:</span>{" "}
                <span className="font-mono text-xs">{selectedItem.scopeData.parent_id}</span>
              </div>
            )}
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
              {addParentScope
                ? `Create a new scope under "${addParentScope.name}".`
                : "Create a new root-level scope."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new_scope_name">Name *</Label>
              <Input
                id="new_scope_name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Sydney Office"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new_scope_level">Level Label *</Label>
              <Input
                id="new_scope_level"
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value)}
                placeholder="e.g., HQ, Division, Department, Branch"
              />
              <p className="text-xs text-muted-foreground">
                A descriptive label for this hierarchy level (e.g., &quot;HQ&quot;, &quot;Division&quot;, &quot;Department&quot;)
              </p>
            </div>
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
              Update scope: {selectedScope?.name}
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
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit_scope_level">Level Label *</Label>
              <Input
                id="edit_scope_level"
                value={editLevel}
                onChange={(e) => setEditLevel(e.target.value)}
                placeholder="e.g., HQ, Division, Department"
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
              Are you sure you want to delete &quot;{selectedScope?.name}&quot;?
              This action cannot be undone and will also delete all child scopes.
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
