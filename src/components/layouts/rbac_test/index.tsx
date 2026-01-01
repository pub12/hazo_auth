// file_description: RBAC/HRBAC Test layout component for testing role-based and hierarchical access control
// Uses unified hazo_scopes table with parent_id hierarchy
// section: client_directive
"use client";

// section: imports
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Checkbox } from "../../ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { TreeView, type TreeDataItem } from "../../ui/tree-view";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import {
  Loader2,
  Play,
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield,
  Building2,
  FolderTree,
  User,
  RefreshCw,
} from "lucide-react";
import { useHazoAuthConfig } from "../../../contexts/hazo_auth_provider";
import { use_hazo_auth } from "../shared/hooks/use_hazo_auth";
import { toast } from "sonner";

// section: types
export type RbacTestLayoutProps = {
  className?: string;
  /** Whether HRBAC is enabled (passed from server) */
  hrbacEnabled?: boolean;
};

type ScopeTreeNode = {
  id: string;
  name: string;
  level: string; // Descriptive label (e.g., "HQ", "Division")
  parent_id: string | null;
  children?: ScopeTreeNode[];
};

type ExtendedTreeDataItem = TreeDataItem & {
  scopeData?: ScopeTreeNode;
};

type TestResult = {
  success: boolean;
  authenticated: boolean;
  permission_ok: boolean;
  scope_ok?: boolean;
  scope_access_via?: {
    scope_id: string;
    scope_name?: string;
  };
  user?: {
    id: string;
    email_address: string;
    name: string | null;
  };
  permissions?: string[];
  missing_permissions?: string[];
  error?: string;
};

type Permission = {
  id: number;
  permission_name: string;
  description: string;
  source: "db" | "config";
};

type UserRecord = {
  id: string;
  name: string | null;
  email_address: string;
  profile_picture_url: string | null;
};

type UserScope = {
  scope_id: string;
  scope_name?: string;
  level?: string;
  role_id: string;
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

// Get user initials for avatar fallback
function getUserInitials(user: UserRecord): string {
  if (user.name) {
    const parts = user.name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return user.name[0]?.toUpperCase() || "";
  }
  return user.email_address[0]?.toUpperCase() || "?";
}

// section: component
/**
 * RBAC/HRBAC Test layout component
 * Allows testing permissions and scope access for different users
 * @param props - Component props
 * @returns RBAC test layout component
 */
export function RbacTestLayout({
  className,
  hrbacEnabled = false,
}: RbacTestLayoutProps) {
  const { apiBasePath } = useHazoAuthConfig();
  const authResult = use_hazo_auth();

  // Users state
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  // Selected user's permissions and scopes
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [userScopes, setUserScopes] = useState<UserScope[]>([]);
  const [userDataLoading, setUserDataLoading] = useState(false);

  // Available permissions state
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  // RBAC test state
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [rbacTesting, setRbacTesting] = useState(false);
  const [rbacResult, setRbacResult] = useState<TestResult | null>(null);

  // HRBAC scope tree state
  const [scopeTree, setScopeTree] = useState<ScopeTreeNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [selectedTreeItem, setSelectedTreeItem] = useState<ExtendedTreeDataItem>();

  // HRBAC test state
  const [hrbacPermissions, setHrbacPermissions] = useState<string[]>([]);
  const [hrbacTesting, setHrbacTesting] = useState(false);
  const [hrbacResult, setHrbacResult] = useState<TestResult | null>(null);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true);
      try {
        const response = await fetch(`${apiBasePath}/user_management/users`);
        const data = await response.json();

        if (data.success) {
          setUsers(data.users || []);
          // Select current user by default if available
          if (authResult.user?.id) {
            setSelectedUserId(authResult.user.id);
          }
        }
      } catch (error) {
        toast.error("Failed to load users");
      } finally {
        setUsersLoading(false);
      }
    };

    void loadUsers();
  }, [apiBasePath, authResult.user?.id]);

  // Update selected user when ID changes
  useEffect(() => {
    if (selectedUserId) {
      const user = users.find((u) => u.id === selectedUserId);
      setSelectedUser(user || null);
    } else {
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
      const userRolesResponse = await fetch(
        `${apiBasePath}/user_management/users/roles?user_id=${selectedUserId}`
      );
      const userRolesData = await userRolesResponse.json();

      if (userRolesData.success && Array.isArray(userRolesData.role_ids) && userRolesData.role_ids.length > 0) {
        // Step 2: Get all roles with their permissions
        const rolesResponse = await fetch(`${apiBasePath}/user_management/roles`);
        const rolesData = await rolesResponse.json();

        if (rolesData.success && Array.isArray(rolesData.roles)) {
          // Step 3: Filter to user's roles and extract permissions
          const userRoleIds = new Set(userRolesData.role_ids);
          const allPermissions = new Set<string>();

          for (const role of rolesData.roles) {
            if (userRoleIds.has(role.role_id)) {
              if (role.permissions && Array.isArray(role.permissions)) {
                role.permissions.forEach((p: string) => allPermissions.add(p));
              }
            }
          }

          setUserPermissions(Array.from(allPermissions));
        } else {
          setUserPermissions([]);
        }
      } else {
        setUserPermissions([]);
      }

      // Load user scopes if HRBAC is enabled
      if (hrbacEnabled) {
        const scopesResponse = await fetch(
          `${apiBasePath}/user_management/users/scopes?user_id=${selectedUserId}&include_details=true`
        );
        const scopesData = await scopesResponse.json();

        if (scopesData.success) {
          setUserScopes(scopesData.scopes || []);
        } else {
          setUserScopes([]);
        }
      }
    } catch (error) {
      toast.error("Failed to load user data");
      setUserPermissions([]);
      setUserScopes([]);
    } finally {
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
          const dbPerms: Permission[] = data.db_permissions.map(
            (p: { id: number; permission_name: string; description: string }) => ({
              id: p.id,
              permission_name: p.permission_name,
              description: p.description,
              source: "db" as const,
            })
          );

          const configPerms: Permission[] = data.config_permissions.map(
            (name: string) => ({
              id: 0,
              permission_name: name,
              description: "",
              source: "config" as const,
            })
          );

          // Dedupe by permission_name, preferring db source
          const permMap = new Map<string, Permission>();
          for (const p of [...configPerms, ...dbPerms]) {
            permMap.set(p.permission_name, p);
          }
          setAvailablePermissions(Array.from(permMap.values()));
        }
      } catch (error) {
        toast.error("Failed to load permissions");
      } finally {
        setPermissionsLoading(false);
      }
    };

    void loadPermissions();
  }, [apiBasePath]);

  // Load scope tree
  const loadScopeTree = useCallback(async () => {
    if (!hrbacEnabled) return;

    setTreeLoading(true);
    try {
      const params = new URLSearchParams({ action: "tree" });
      const response = await fetch(`${apiBasePath}/scope_management/scopes?${params}`);
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
  }, [apiBasePath, hrbacEnabled]);

  useEffect(() => {
    void loadScopeTree();
  }, [loadScopeTree]);

  // Convert tree to TreeDataItem format
  const treeData = useMemo(() => {
    return convertToTreeData(scopeTree);
  }, [scopeTree]);

  // Handle tree item selection
  const handleTreeSelectChange = (item: TreeDataItem | undefined) => {
    setSelectedTreeItem(item as ExtendedTreeDataItem | undefined);
  };

  // Handle RBAC permission toggle
  const handlePermissionToggle = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions((prev) => [...prev, permission]);
    } else {
      setSelectedPermissions((prev) => prev.filter((p) => p !== permission));
    }
  };

  // Handle HRBAC permission toggle
  const handleHrbacPermissionToggle = (permission: string, checked: boolean) => {
    if (checked) {
      setHrbacPermissions((prev) => [...prev, permission]);
    } else {
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
    } catch (error) {
      setRbacResult({
        success: false,
        authenticated: false,
        permission_ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setRbacTesting(false);
    }
  };

  // Run HRBAC test
  const handleRunHrbacTest = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    if (!selectedTreeItem?.scopeData) {
      toast.error("Please select a scope from the tree");
      return;
    }

    setHrbacTesting(true);
    setHrbacResult(null);

    try {
      const params = new URLSearchParams();
      params.append("test_user_id", selectedUserId);
      params.append("scope_id", selectedTreeItem.scopeData.id);
      hrbacPermissions.forEach((p) => {
        params.append("required_permissions", p);
      });

      const response = await fetch(`${apiBasePath}/rbac_test?${params}`);
      const data = await response.json();

      setHrbacResult(data);
    } catch (error) {
      setHrbacResult({
        success: false,
        authenticated: false,
        permission_ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
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
    return (
      <div className="cls_rbac_test_layout flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!authResult.authenticated) {
    return (
      <div className="cls_rbac_test_layout flex flex-col items-center justify-center p-8 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h1 className="text-xl font-semibold">Authentication Required</h1>
        <p className="text-muted-foreground">Please log in to access the RBAC test tool.</p>
      </div>
    );
  }

  // Check for admin_test_access permission
  if (!authResult.permissions.includes("admin_test_access")) {
    return (
      <div className="cls_rbac_test_layout flex flex-col items-center justify-center p-8 gap-4">
        <Shield className="h-12 w-12 text-amber-500" />
        <h1 className="text-xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground text-center">
          You need the <code className="bg-muted px-1 py-0.5 rounded">admin_test_access</code>{" "}
          permission to use the RBAC test tool.
        </p>
      </div>
    );
  }

  return (
    <div className={`cls_rbac_test_layout flex flex-col gap-6 p-4 w-full max-w-5xl mx-auto ${className || ""}`}>
      <div className="cls_rbac_test_header">
        <h1 className="text-2xl font-bold">RBAC & HRBAC Test</h1>
        <p className="text-muted-foreground">
          Test Role-Based Access Control (RBAC) and Hierarchical RBAC (HRBAC) for any user.
        </p>
      </div>

      {/* User Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Select User to Test
          </CardTitle>
          <CardDescription>Choose a user to test their permissions and scope access</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* User Dropdown */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="user_select">User</Label>
            {usersLoading ? (
              <div className="flex items-center gap-2 p-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading users...</span>
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user_select" className="w-full">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.profile_picture_url || undefined} />
                          <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name || user.email_address}</span>
                        {user.name && (
                          <span className="text-muted-foreground text-xs">({user.email_address})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Selected User Info */}
          {selectedUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedUser.profile_picture_url || undefined} />
                  <AvatarFallback className="bg-slate-200 text-slate-600">
                    {getUserInitials(selectedUser)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.name || selectedUser.email_address}</p>
                  {selectedUser.name && (
                    <p className="text-sm text-muted-foreground">{selectedUser.email_address}</p>
                  )}
                  <p className="text-xs text-muted-foreground font-mono">
                    {selectedUser.id.substring(0, 8)}...
                  </p>
                </div>
              </div>

              {userDataLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {/* User Permissions */}
                  <div>
                    <Label className="text-muted-foreground text-xs">Permissions</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {userPermissions.length > 0 ? (
                        userPermissions.map((p) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                          >
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </div>
                  </div>

                  {/* User Scopes (if HRBAC enabled) */}
                  {hrbacEnabled && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Assigned Scopes</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {userScopes.length > 0 ? (
                          userScopes.map((s) => (
                            <span
                              key={s.scope_id}
                              className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs"
                              title={`${s.level}: ${s.scope_name || s.scope_id}`}
                            >
                              {s.scope_name || s.scope_id.substring(0, 8) + "..."}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">None</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Tabs */}
      <Tabs defaultValue="rbac" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rbac" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            RBAC Test
          </TabsTrigger>
          <TabsTrigger value="hrbac" className="flex items-center gap-2" disabled={!hrbacEnabled}>
            <FolderTree className="h-4 w-4" />
            HRBAC Test {!hrbacEnabled && "(Disabled)"}
          </TabsTrigger>
        </TabsList>

        {/* RBAC Test Tab */}
        <TabsContent value="rbac" className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Permission Test</CardTitle>
              <CardDescription>
                Select permissions to test if the selected user has them
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {permissionsLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[300px] overflow-auto p-2 border rounded">
                  {availablePermissions.map((perm) => (
                    <div key={perm.permission_name} className="flex items-center gap-2">
                      <Checkbox
                        id={`rbac_${perm.permission_name}`}
                        checked={selectedPermissions.includes(perm.permission_name)}
                        onCheckedChange={(checked) =>
                          handlePermissionToggle(perm.permission_name, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`rbac_${perm.permission_name}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {perm.permission_name}
                        {userPermissions.includes(perm.permission_name) && (
                          <CheckCircle className="inline h-3 w-3 text-green-500 ml-1" />
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Selected: {selectedPermissions.length} permission(s)</span>
                {selectedPermissions.length > 0 && (
                  <span className="text-xs">({selectedPermissions.join(", ")})</span>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleRunRbacTest} disabled={rbacTesting || !selectedUserId}>
                  {rbacTesting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Test Permissions
                    </>
                  )}
                </Button>
                <Button onClick={handleClearRbac} variant="outline">
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* RBAC Results */}
          {rbacResult && (
            <Card
              className={
                rbacResult.permission_ok
                  ? "border-green-200 bg-green-50/50"
                  : "border-red-200 bg-red-50/50"
              }
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {rbacResult.permission_ok ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-700">Permission Check Passed</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-700">Permission Check Failed</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {rbacResult.error && (
                  <div className="bg-red-100 border border-red-200 rounded p-3">
                    <p className="text-red-700 text-sm">{rbacResult.error}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Authenticated</Label>
                    <p
                      className={`text-sm font-medium ${rbacResult.authenticated ? "text-green-600" : "text-red-600"}`}
                    >
                      {rbacResult.authenticated ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Permission OK</Label>
                    <p
                      className={`text-sm font-medium ${rbacResult.permission_ok ? "text-green-600" : "text-red-600"}`}
                    >
                      {rbacResult.permission_ok ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                {rbacResult.missing_permissions && rbacResult.missing_permissions.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Missing Permissions</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rbacResult.missing_permissions.map((p) => (
                        <span
                          key={p}
                          className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* HRBAC Test Tab */}
        <TabsContent value="hrbac" className="flex flex-col gap-4">
          {!hrbacEnabled ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
                <AlertCircle className="h-12 w-12 text-amber-500" />
                <h2 className="text-lg font-semibold">HRBAC Not Enabled</h2>
                <p className="text-muted-foreground text-center max-w-md">
                  Enable HRBAC by setting{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">enable_hrbac = true</code> in the{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">[hazo_auth__scope_hierarchy]</code>{" "}
                  section.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Scope Access Test</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void loadScopeTree()}
                      disabled={treeLoading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${treeLoading ? "animate-spin" : ""}`}
                      />
                      Refresh
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Select a scope from the tree and test if the selected user has access
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
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
                          No scopes available. Create scopes in User Management first.
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-lg max-h-[250px] overflow-auto">
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
                        {selectedTreeItem.scopeData.level} - {selectedTreeItem.scopeData.id.substring(0, 8)}...
                      </p>
                    </div>
                  )}

                  {/* Optional permissions for HRBAC */}
                  <div className="flex flex-col gap-2">
                    <Label>Additional Permissions (Optional)</Label>
                    {permissionsLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[150px] overflow-auto p-2 border rounded">
                        {availablePermissions.map((perm) => (
                          <div key={perm.permission_name} className="flex items-center gap-2">
                            <Checkbox
                              id={`hrbac_${perm.permission_name}`}
                              checked={hrbacPermissions.includes(perm.permission_name)}
                              onCheckedChange={(checked) =>
                                handleHrbacPermissionToggle(perm.permission_name, checked as boolean)
                              }
                            />
                            <label
                              htmlFor={`hrbac_${perm.permission_name}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {perm.permission_name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleRunHrbacTest}
                      disabled={hrbacTesting || !selectedUserId || !selectedTreeItem?.scopeData}
                    >
                      {hrbacTesting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Test Scope Access
                        </>
                      )}
                    </Button>
                    <Button onClick={handleClearHrbac} variant="outline">
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* HRBAC Results */}
              {hrbacResult && (
                <Card
                  className={
                    hrbacResult.scope_ok
                      ? "border-green-200 bg-green-50/50"
                      : "border-red-200 bg-red-50/50"
                  }
                >
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {hrbacResult.scope_ok ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-green-700">Scope Access Granted</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="text-red-700">Scope Access Denied</span>
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {hrbacResult.error && (
                      <div className="bg-red-100 border border-red-200 rounded p-3">
                        <p className="text-red-700 text-sm">{hrbacResult.error}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-muted-foreground text-xs">Authenticated</Label>
                        <p
                          className={`text-sm font-medium ${hrbacResult.authenticated ? "text-green-600" : "text-red-600"}`}
                        >
                          {hrbacResult.authenticated ? "Yes" : "No"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Permission OK</Label>
                        <p
                          className={`text-sm font-medium ${hrbacResult.permission_ok ? "text-green-600" : "text-red-600"}`}
                        >
                          {hrbacResult.permission_ok ? "Yes" : "No"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Scope OK</Label>
                        <p
                          className={`text-sm font-medium ${
                            hrbacResult.scope_ok === undefined
                              ? "text-muted-foreground"
                              : hrbacResult.scope_ok
                                ? "text-green-600"
                                : "text-red-600"
                          }`}
                        >
                          {hrbacResult.scope_ok === undefined
                            ? "N/A"
                            : hrbacResult.scope_ok
                              ? "Yes"
                              : "No"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Access Via</Label>
                        <p className="text-sm">
                          {hrbacResult.scope_access_via
                            ? hrbacResult.scope_access_via.scope_name || hrbacResult.scope_access_via.scope_id.substring(0, 8) + "..."
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {hrbacResult.scope_access_via && (
                      <div className="bg-green-100 border border-green-200 rounded p-3">
                        <p className="text-green-700 text-sm">
                          Access granted via scope:{" "}
                          <strong>{hrbacResult.scope_access_via.scope_name || hrbacResult.scope_access_via.scope_id}</strong>
                        </p>
                      </div>
                    )}

                    {hrbacResult.missing_permissions &&
                      hrbacResult.missing_permissions.length > 0 && (
                        <div>
                          <Label className="text-muted-foreground text-xs">
                            Missing Permissions
                          </Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {hrbacResult.missing_permissions.map((p) => (
                              <span
                                key={p}
                                className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    <details className="text-sm">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Show raw response
                      </summary>
                      <pre className="mt-2 bg-muted p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(hrbacResult, null, 2)}
                      </pre>
                    </details>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
