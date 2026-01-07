// file_description: User Scopes tab component for assigning scopes to users in HRBAC
// Uses unified hazo_scopes table with parent_id hierarchy
// section: client_directive
"use client";

// section: imports
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { TreeView, type TreeDataItem } from "../../../ui/tree-view";
import {
  Loader2,
  Plus,
  Trash2,
  Search,
  CircleCheck,
  CircleX,
  ChevronRight,
  Building2,
  FolderTree,
} from "lucide-react";
import { toast } from "sonner";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider";

// section: types
export type UserScopesTabProps = {
  className?: string;
};

type User = {
  id: string;
  name: string | null;
  email_address: string;
  profile_picture_url: string | null;
};

// Unified UserScope type for membership-based multi-tenancy
type UserScope = {
  user_id: string;
  scope_id: string;
  scope_name?: string;
  level?: string;
  role_id: string;
  root_scope_id: string;
  created_at: string;
  changed_at: string;
};

// Unified ScopeRecord type for the single hazo_scopes table
type ScopeRecord = {
  id: string;
  name: string;
  level: string; // Descriptive label (e.g., "HQ", "Division", "Department")
  parent_id: string | null;
  created_at: string;
  changed_at: string;
};

type Role = {
  id: string;
  name: string;
  description: string | null;
};

type ScopeTreeNode = ScopeRecord & {
  children?: ScopeTreeNode[];
};

type ExtendedTreeDataItem = TreeDataItem & {
  scopeData?: ScopeTreeNode;
};

// Convert ScopeTreeNode to TreeDataItem format for selection
function convertToTreeData(nodes: ScopeTreeNode[]): ExtendedTreeDataItem[] {
  return nodes.map((node) => {
    const hasChildren = node.children && node.children.length > 0;

    const item: ExtendedTreeDataItem = {
      id: node.id,
      name: `${node.name} (${node.level})`,
      icon: Building2,
      scopeData: node,
    };

    if (hasChildren) {
      item.children = convertToTreeData(node.children!);
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
export function UserScopesTab({ className }: UserScopesTabProps) {
  const { apiBasePath } = useHazoAuthConfig();

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // User scopes state
  const [userScopes, setUserScopes] = useState<UserScope[]>([]);
  const [scopesLoading, setScopesLoading] = useState(false);
  const [inheritedScopeIds, setInheritedScopeIds] = useState<string[]>([]);

  // Add scope dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [scopeTree, setScopeTree] = useState<ScopeTreeNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [selectedTreeItem, setSelectedTreeItem] =
    useState<ExtendedTreeDataItem>();
  const [actionLoading, setActionLoading] = useState(false);

  // Roles state
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  // Delete scope dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scopeToDelete, setScopeToDelete] = useState<UserScope | null>(null);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true);
      try {
        const response = await fetch(`${apiBasePath}/user_management/users`);
        const data = await response.json();

        if (data.success) {
          setUsers(data.users || []);
        } else {
          toast.error(data.error || "Failed to load users");
        }
      } catch (error) {
        toast.error("Failed to load users");
      } finally {
        setUsersLoading(false);
      }
    };

    void loadUsers();
  }, [apiBasePath]);

  // Load user scopes when user selected
  const loadUserScopes = useCallback(async () => {
    if (!selectedUser) {
      setUserScopes([]);
      setInheritedScopeIds([]);
      return;
    }

    setScopesLoading(true);
    try {
      const params = new URLSearchParams({
        user_id: selectedUser.id,
        include_details: "true",
      });
      const response = await fetch(
        `${apiBasePath}/user_management/users/scopes?${params}`
      );
      const data = await response.json();

      if (data.success) {
        setUserScopes(data.direct_scopes || []);
        setInheritedScopeIds(data.inherited_scope_ids || []);
      } else {
        toast.error(data.error || "Failed to load user scopes");
      }
    } catch (error) {
      toast.error("Failed to load user scopes");
    } finally {
      setScopesLoading(false);
    }
  }, [apiBasePath, selectedUser]);

  useEffect(() => {
    void loadUserScopes();
  }, [loadUserScopes]);

  // Load scope tree for add dialog (all scopes)
  const loadScopeTree = useCallback(async () => {
    setTreeLoading(true);
    try {
      const params = new URLSearchParams({ action: "tree" });
      const response = await fetch(
        `${apiBasePath}/scope_management/scopes?${params}`
      );
      const data = await response.json();

      if (data.success) {
        setScopeTree(data.tree || []);
      } else {
        setScopeTree([]);
      }
    } catch (error) {
      setScopeTree([]);
    } finally {
      setTreeLoading(false);
    }
  }, [apiBasePath]);

  // Load roles for add dialog
  const loadRoles = useCallback(async () => {
    setRolesLoading(true);
    try {
      const response = await fetch(`${apiBasePath}/user_management/roles`);
      const data = await response.json();

      if (data.success) {
        setRoles(data.roles || []);
        // Auto-select first role if available and none selected
        if (!selectedRoleId && data.roles?.length > 0) {
          setSelectedRoleId(data.roles[0].id);
        }
      } else {
        setRoles([]);
      }
    } catch (error) {
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  }, [apiBasePath, selectedRoleId]);

  useEffect(() => {
    if (addDialogOpen) {
      void loadScopeTree();
      void loadRoles();
    }
  }, [addDialogOpen, loadScopeTree, loadRoles]);

  // Filter users by search
  const filteredUsers = users.filter((user) => {
    const search = userSearch.toLowerCase();
    return (
      (user.name?.toLowerCase().includes(search) || false) ||
      user.email_address.toLowerCase().includes(search)
    );
  });

  // Get user initials
  const getUserInitials = (user: User): string => {
    if (user.name) {
      const parts = user.name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return user.name[0]?.toUpperCase() || "";
    }
    return user.email_address[0]?.toUpperCase() || "?";
  };

  // Convert tree to TreeDataItem format
  const treeData = useMemo(() => {
    return convertToTreeData(scopeTree);
  }, [scopeTree]);

  // Handle tree item selection
  const handleTreeSelectChange = (item: TreeDataItem | undefined) => {
    setSelectedTreeItem(item as ExtendedTreeDataItem | undefined);
  };

  // Handle add scope
  const handleAddScope = async () => {
    if (!selectedUser || !selectedTreeItem?.scopeData) {
      toast.error("Please select a scope from the tree");
      return;
    }

    if (!selectedRoleId) {
      toast.error("Please select a role");
      return;
    }

    const scope = selectedTreeItem.scopeData;

    setActionLoading(true);
    try {
      const response = await fetch(
        `${apiBasePath}/user_management/users/scopes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: selectedUser.id,
            scope_id: scope.id,
            role_id: selectedRoleId,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Scope assigned successfully");
        setAddDialogOpen(false);
        setSelectedTreeItem(undefined);
        setSelectedRoleId("");
        await loadUserScopes();
      } else {
        toast.error(data.error || "Failed to assign scope");
      }
    } catch (error) {
      toast.error("Failed to assign scope");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle remove scope
  const handleRemoveScope = async () => {
    if (!selectedUser || !scopeToDelete) return;

    setActionLoading(true);
    try {
      const params = new URLSearchParams({
        user_id: selectedUser.id,
        scope_id: scopeToDelete.scope_id,
      });

      const response = await fetch(
        `${apiBasePath}/user_management/users/scopes?${params}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Scope removed successfully");
        setDeleteDialogOpen(false);
        setScopeToDelete(null);
        await loadUserScopes();
      } else {
        toast.error(data.error || "Failed to remove scope");
      }
    } catch (error) {
      toast.error("Failed to remove scope");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className={`cls_user_scopes_tab flex flex-col lg:flex-row gap-4 w-full min-h-[500px] ${className || ""}`}
    >
      {/* Left panel: Users list */}
      <div className="cls_user_scopes_users_panel w-full lg:w-1/3 flex flex-col border rounded-lg">
        <div className="cls_user_scopes_users_header p-4 border-b bg-muted/30">
          <h3 className="font-semibold mb-2">Select User</h3>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-8"
            />
          </div>
        </div>
        <div className="cls_user_scopes_users_list flex-1 overflow-auto">
          {usersLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">
              No users found.
            </div>
          ) : (
            <div className="divide-y">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`cls_user_scopes_user_item flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedUser?.id === user.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profile_picture_url || undefined} />
                    <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.name || user.email_address}
                    </p>
                    {user.name && (
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email_address}
                      </p>
                    )}
                  </div>
                  {selectedUser?.id === user.id && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel: Scope assignments */}
      <div className="cls_user_scopes_assignments_panel w-full lg:w-2/3 flex flex-col border rounded-lg">
        <div className="cls_user_scopes_assignments_header p-4 border-b bg-muted/30 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">
              {selectedUser
                ? `Scopes for ${selectedUser.name || selectedUser.email_address}`
                : "Select a user to view scopes"}
            </h3>
            {selectedUser && inheritedScopeIds.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Also has access to {inheritedScopeIds.length} inherited scope(s)
              </p>
            )}
          </div>
          {selectedUser && (
            <Button
              onClick={() => {
                setSelectedTreeItem(undefined);
                setAddDialogOpen(true);
              }}
              variant="default"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Scope
            </Button>
          )}
        </div>
        <div className="cls_user_scopes_assignments_content flex-1 overflow-auto">
          {!selectedUser ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a user from the left panel to manage their scope
              assignments.
            </div>
          ) : scopesLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : userScopes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <p>No scopes assigned to this user.</p>
              <Button
                onClick={() => {
                  setSelectedTreeItem(undefined);
                  setAddDialogOpen(true);
                }}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Assign First Scope
              </Button>
            </div>
          ) : (
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Scope Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Scope ID</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead className="text-right w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userScopes.map((scope) => (
                  <TableRow key={scope.scope_id}>
                    <TableCell className="font-medium">
                      {scope.scope_name || "Unknown"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {scope.level || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {scope.scope_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(scope.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => {
                          setScopeToDelete(scope);
                          setDeleteDialogOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Add Scope Dialog with Tree View */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="cls_user_scopes_add_dialog sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Scope Assignment</DialogTitle>
            <DialogDescription>
              Select a scope from the tree to assign to{" "}
              {selectedUser?.name || selectedUser?.email_address}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            {/* Scope Tree */}
            <div className="flex flex-col gap-2">
              <Label>Select Scope</Label>
              {treeLoading ? (
                <div className="flex items-center justify-center p-8 border rounded-lg">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : scopeTree.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg border-dashed">
                  <FolderTree className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    No scopes available. Create scopes in the Scope Hierarchy tab first.
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg max-h-[300px] overflow-auto">
                  <TreeView
                    data={treeData}
                    expandAll
                    defaultNodeIcon={Building2}
                    defaultLeafIcon={Building2}
                    onSelectChange={handleTreeSelectChange}
                    initialSelectedItemId={selectedTreeItem?.id}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Selected scope info */}
            {selectedTreeItem?.scopeData && (
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm">
                  <span className="font-medium">Selected:</span>{" "}
                  {selectedTreeItem.scopeData.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedTreeItem.scopeData.level} - ID: {selectedTreeItem.scopeData.id.substring(0, 8)}...
                </p>
              </div>
            )}

            {/* Role Selection */}
            <div className="flex flex-col gap-2">
              <Label>Assign Role</Label>
              {rolesLoading ? (
                <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading roles...
                </div>
              ) : roles.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No roles available. Create roles in the Roles tab first.
                </p>
              ) : (
                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                        {role.description && (
                          <span className="text-muted-foreground ml-2">
                            - {role.description}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddScope}
              disabled={actionLoading || !selectedTreeItem?.scopeData || !selectedRoleId}
              variant="default"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <CircleCheck className="h-4 w-4 mr-2" />
                  Assign Scope
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

      {/* Delete Scope Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Scope Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the scope &quot;
              {scopeToDelete?.scope_name || scopeToDelete?.scope_id.substring(0, 8)}&quot; from{" "}
              {selectedUser?.name || selectedUser?.email_address}? This will
              also revoke access to any child scopes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleRemoveScope}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setScopeToDelete(null);
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
