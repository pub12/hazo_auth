// file_description: User Management layout component with tabs for managing users, roles, permissions, and HRBAC scopes
// section: client_directive
"use client";

// section: imports
import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { use_hazo_auth } from "../shared/hooks/use_hazo_auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Button } from "../../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { RolesMatrix } from "./components/roles_matrix";
import { ScopeHierarchyTab } from "./components/scope_hierarchy_tab";
import { ScopeLabelsTab } from "./components/scope_labels_tab";
import { UserScopesTab } from "./components/user_scopes_tab";
import { UserX, KeyRound, Edit, Trash2, Loader2, CircleCheck, CircleX, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { useHazoAuthConfig } from "../../../contexts/hazo_auth_provider";

// section: types
export type UserManagementLayoutProps = {
  className?: string;
  /** Whether HRBAC is enabled (passed from server) */
  hrbacEnabled?: boolean;
  /** Default organization for HRBAC scopes */
  defaultOrg?: string;
};

type User = {
  id: string;
  name: string | null;
  email_address: string;
  email_verified: boolean;
  is_active: boolean;
  last_logon: string | null;
  created_at: string | null;
  profile_picture_url: string | null;
  profile_source: string | null;
};

type Permission = {
  id: number;
  permission_name: string;
  description: string;
  source: "db" | "config";
};

// section: component
/**
 * User Management layout component with tabs for managing users, roles, permissions, and HRBAC scopes
 * Tab 1: Manage Users - data table with user details and actions
 * Tab 2: Roles - roles-permissions matrix
 * Tab 3: Permissions - manage permissions from DB and config
 * Tab 4: Scope Labels - customize scope level labels (if HRBAC enabled)
 * Tab 5: Scope Hierarchy - manage HRBAC scopes (if HRBAC enabled)
 * Tab 6: User Scopes - assign scopes to users (if HRBAC enabled)
 * @param props - Component props
 * @returns User Management layout component
 */
export function UserManagementLayout({ className, hrbacEnabled = false, defaultOrg = "" }: UserManagementLayoutProps) {
  const { apiBasePath } = useHazoAuthConfig();

  // Permission checks
  const authResult = use_hazo_auth();
  const hasUserManagementPermission = authResult.authenticated &&
    authResult.permissions.includes("admin_user_management");
  const hasRoleManagementPermission = authResult.authenticated &&
    authResult.permissions.includes("admin_role_management");
  const hasPermissionManagementPermission = authResult.authenticated &&
    authResult.permissions.includes("admin_permission_management");
  const hasScopeHierarchyPermission = authResult.authenticated &&
    authResult.permissions.includes("admin_scope_hierarchy_management");
  const hasUserScopeAssignmentPermission = authResult.authenticated &&
    authResult.permissions.includes("admin_user_scope_assignment");

  // Determine which tabs to show
  const showUsersTab = hasUserManagementPermission;
  const showRolesTab = hasRoleManagementPermission;
  const showPermissionsTab = hasPermissionManagementPermission;
  const showScopeHierarchyTab = hrbacEnabled && hasScopeHierarchyPermission;
  const showScopeLabelsTab = hrbacEnabled && hasScopeHierarchyPermission;
  const showUserScopesTab = hrbacEnabled && hasUserScopeAssignmentPermission;
  const hasAnyPermission = showUsersTab || showRolesTab || showPermissionsTab || showScopeHierarchyTab || showScopeLabelsTab || showUserScopesTab;

  // Tab 1: Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [userDetailDialogOpen, setUserDetailDialogOpen] = useState(false);
  const [assignRolesDialogOpen, setAssignRolesDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [usersActionLoading, setUsersActionLoading] = useState(false);

  // Tab 3: Permissions state
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [editPermissionDialogOpen, setEditPermissionDialogOpen] = useState(false);
  const [addPermissionDialogOpen, setAddPermissionDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [newPermissionName, setNewPermissionName] = useState("");
  const [newPermissionDescription, setNewPermissionDescription] = useState("");
  const [permissionsActionLoading, setPermissionsActionLoading] = useState(false);
  const [migrateLoading, setMigrateLoading] = useState(false);

  // Load users function (reusable)
  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const response = await fetch(`${apiBasePath}/user_management/users`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error("Failed to load users");
      }
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Load users (only if user has permission)
  useEffect(() => {
    if (!showUsersTab) {
      setUsersLoading(false);
      return;
    }

    void loadUsers();
  }, [showUsersTab, loadUsers]);

  // Load permissions (only if user has permission)
  useEffect(() => {
    if (!showPermissionsTab) {
      setPermissionsLoading(false);
      return;
    }

    const loadPermissions = async () => {
      setPermissionsLoading(true);
      try {
        const response = await fetch(`${apiBasePath}/user_management/permissions`);
        const data = await response.json();

        if (data.success) {
          const db_perms: Permission[] = data.db_permissions.map((p: {
            id: number;
            permission_name: string;
            description: string;
          }) => ({
            id: p.id,
            permission_name: p.permission_name,
            description: p.description,
            source: "db" as const,
          }));

          const config_perms: Permission[] = data.config_permissions.map((name: string) => ({
            id: 0, // Temporary ID for config permissions
            permission_name: name,
            description: "",
            source: "config" as const,
          }));

          setPermissions([...db_perms, ...config_perms]);
        } else {
          toast.error("Failed to load permissions");
        }
      } catch (error) {
        toast.error("Failed to load permissions");
      } finally {
        setPermissionsLoading(false);
      }
    };

    void loadPermissions();
  }, [showPermissionsTab]);

  // Handle deactivate user
  const handleDeactivateUser = async () => {
    if (!selectedUser) return;

    setUsersActionLoading(true);
    try {
      const response = await fetch(`${apiBasePath}/user_management/users`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          is_active: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("User deactivated successfully");
        setDeactivateDialogOpen(false);
        setSelectedUser(null);

        // Reload users
        const reload_response = await fetch(`${apiBasePath}/user_management/users`);
        const reload_data = await reload_response.json();
        if (reload_data.success) {
          setUsers(reload_data.users);
        }
      } else {
        toast.error(data.error || "Failed to deactivate user");
      }
    } catch (error) {
      toast.error("Failed to deactivate user");
    } finally {
      setUsersActionLoading(false);
    }
  };

  // Handle reset password
  const handleResetPassword = async () => {
    if (!selectedUser) return;

    setUsersActionLoading(true);
    try {
      const response = await fetch(`${apiBasePath}/user_management/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Password reset email sent successfully");
        setResetPasswordDialogOpen(false);
        setSelectedUser(null);
      } else {
        toast.error(data.error || "Failed to send password reset email");
      }
    } catch (error) {
      toast.error("Failed to send password reset email");
    } finally {
      setUsersActionLoading(false);
    }
  };


  // Handle migrate permissions
  const handleMigratePermissions = async () => {
    setMigrateLoading(true);
    try {
      const response = await fetch(`${apiBasePath}/user_management/permissions?action=migrate`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        const created_count = data.created?.length || 0;
        const skipped_count = data.skipped?.length || 0;

        if (created_count > 0) {
          toast.success(
            `Migrated ${created_count} permission(s) to database. ${skipped_count} already existed.`
          );
        } else {
          toast.info(`All permissions already exist in database. ${skipped_count} skipped.`);
        }

        // Show detailed list in toast if there are changes
        if (data.created && data.created.length > 0) {
          toast.info(`Created: ${data.created.join(", ")}`);
        }
        if (data.skipped && data.skipped.length > 0) {
          toast.info(`Skipped: ${data.skipped.join(", ")}`);
        }

        // Reload permissions
        const reload_response = await fetch(`${apiBasePath}/user_management/permissions`);
        const reload_data = await reload_response.json();
        if (reload_data.success) {
          const db_perms: Permission[] = reload_data.db_permissions.map((p: {
            id: number;
            permission_name: string;
            description: string;
          }) => ({
            id: p.id,
            permission_name: p.permission_name,
            description: p.description,
            source: "db" as const,
          }));

          const config_perms: Permission[] = reload_data.config_permissions.map((name: string) => ({
            id: 0,
            permission_name: name,
            description: "",
            source: "config" as const,
          }));

          setPermissions([...db_perms, ...config_perms]);
        }
      } else {
        toast.error(data.error || "Failed to migrate permissions");
      }
    } catch (error) {
      toast.error("Failed to migrate permissions");
    } finally {
      setMigrateLoading(false);
    }
  };

  // Handle edit permission
  const handleEditPermission = async () => {
    if (!editingPermission || editingPermission.source === "config") return;

    setPermissionsActionLoading(true);
    try {
      const response = await fetch(`${apiBasePath}/user_management/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permission_id: editingPermission.id,
          description: editDescription,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Permission updated successfully");
        setEditPermissionDialogOpen(false);
        setEditingPermission(null);
        setEditDescription("");

        // Reload permissions
        const reload_response = await fetch(`${apiBasePath}/user_management/permissions`);
        const reload_data = await reload_response.json();
        if (reload_data.success) {
          const db_perms: Permission[] = reload_data.db_permissions.map((p: {
            id: number;
            permission_name: string;
            description: string;
          }) => ({
            id: p.id,
            permission_name: p.permission_name,
            description: p.description,
            source: "db" as const,
          }));

          const config_perms: Permission[] = reload_data.config_permissions.map((name: string) => ({
            id: 0,
            permission_name: name,
            description: "",
            source: "config" as const,
          }));

          setPermissions([...db_perms, ...config_perms]);
        }
      } else {
        toast.error(data.error || "Failed to update permission");
      }
    } catch (error) {
      toast.error("Failed to update permission");
    } finally {
      setPermissionsActionLoading(false);
    }
  };

  // Handle add permission
  const handleAddPermission = async () => {
    if (!newPermissionName.trim()) {
      toast.error("Permission name is required");
      return;
    }

    setPermissionsActionLoading(true);
    try {
      const response = await fetch(`${apiBasePath}/user_management/permissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permission_name: newPermissionName.trim(),
          description: newPermissionDescription.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Permission created successfully");
        setAddPermissionDialogOpen(false);
        setNewPermissionName("");
        setNewPermissionDescription("");

        // Reload permissions
        const reload_response = await fetch(`${apiBasePath}/user_management/permissions`);
        const reload_data = await reload_response.json();
        if (reload_data.success) {
          const db_perms: Permission[] = reload_data.db_permissions.map((p: {
            id: number;
            permission_name: string;
            description: string;
          }) => ({
            id: p.id,
            permission_name: p.permission_name,
            description: p.description,
            source: "db" as const,
          }));

          const config_perms: Permission[] = reload_data.config_permissions.map((name: string) => ({
            id: 0,
            permission_name: name,
            description: "",
            source: "config" as const,
          }));

          setPermissions([...db_perms, ...config_perms]);
        }
      } else {
        toast.error(data.error || "Failed to create permission");
      }
    } catch (error) {
      toast.error("Failed to create permission");
    } finally {
      setPermissionsActionLoading(false);
    }
  };

  // Handle delete permission
  const handleDeletePermission = async (permission: Permission) => {
    if (permission.source === "config") return;

    setPermissionsActionLoading(true);
    try {
      const response = await fetch(
        `${apiBasePath}/user_management/permissions?permission_id=${permission.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Permission deleted successfully");

        // Reload permissions
        const reload_response = await fetch(`${apiBasePath}/user_management/permissions`);
        const reload_data = await reload_response.json();
        if (reload_data.success) {
          const db_perms: Permission[] = reload_data.db_permissions.map((p: {
            id: number;
            permission_name: string;
            description: string;
          }) => ({
            id: p.id,
            permission_name: p.permission_name,
            description: p.description,
            source: "db" as const,
          }));

          const config_perms: Permission[] = reload_data.config_permissions.map((name: string) => ({
            id: 0,
            permission_name: name,
            description: "",
            source: "config" as const,
          }));

          setPermissions([...db_perms, ...config_perms]);
        }
      } else {
        toast.error(data.error || "Failed to delete permission");
      }
    } catch (error) {
      toast.error("Failed to delete permission");
    } finally {
      setPermissionsActionLoading(false);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = (user: User): string => {
    if (user.name) {
      const parts = user.name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return user.name[0]?.toUpperCase() || "";
    }
    if (user.email_address) {
      return user.email_address[0]?.toUpperCase() || "";
    }
    return "?";
  };

  return (
    <div className={`cls_user_management_layout flex flex-col gap-4 w-full ${className || ""}`}>
      {/* Show loading spinner while checking permissions */}
      {authResult.loading ? (
        <div className="cls_user_management_permissions_loading flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : !hasAnyPermission ? (
        <div className="cls_user_management_no_permissions flex flex-col items-center justify-center p-8 gap-4">
          <p className="text-lg font-semibold text-slate-700">
            Access Denied
          </p>
          <p className="text-sm text-muted-foreground text-center">
            You don&apos;t have permission to access User Management. Please contact your administrator.
          </p>
        </div>
      ) : (
        <Tabs
          defaultValue={
            showUsersTab ? "users" :
            showRolesTab ? "roles" :
            showPermissionsTab ? "permissions" :
            showScopeLabelsTab ? "scope_labels" :
            showScopeHierarchyTab ? "scope_hierarchy" :
            showUserScopesTab ? "user_scopes" : "users"
          }
          className="cls_user_management_tabs w-full"
        >
          <TabsList className="cls_user_management_tabs_list flex w-full flex-wrap">
            {showUsersTab && (
              <TabsTrigger value="users" className="cls_user_management_tabs_trigger flex-1">
                Manage Users
              </TabsTrigger>
            )}
            {showRolesTab && (
              <TabsTrigger value="roles" className="cls_user_management_tabs_trigger flex-1">
                Roles
              </TabsTrigger>
            )}
            {showPermissionsTab && (
              <TabsTrigger value="permissions" className="cls_user_management_tabs_trigger flex-1">
                Permissions
              </TabsTrigger>
            )}
            {showScopeLabelsTab && (
              <TabsTrigger value="scope_labels" className="cls_user_management_tabs_trigger flex-1">
                Scope Labels
              </TabsTrigger>
            )}
            {showScopeHierarchyTab && (
              <TabsTrigger value="scope_hierarchy" className="cls_user_management_tabs_trigger flex-1">
                Scope Hierarchy
              </TabsTrigger>
            )}
            {showUserScopesTab && (
              <TabsTrigger value="user_scopes" className="cls_user_management_tabs_trigger flex-1">
                User Scopes
              </TabsTrigger>
            )}
          </TabsList>

          {/* Tab 1: Manage Users */}
          {showUsersTab && (
            <TabsContent value="users" className="cls_user_management_tab_users w-full">
          {usersLoading ? (
            <div className="cls_user_management_users_loading flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="cls_user_management_users_table_container border rounded-lg overflow-auto w-full">
              <Table className="cls_user_management_users_table w-full">
                <TableHeader className="cls_user_management_users_table_header">
                  <TableRow className="cls_user_management_users_table_header_row">
                    <TableHead className="cls_user_management_users_table_header_profile_pic w-16">
                      Photo
                    </TableHead>
                    <TableHead className="cls_user_management_users_table_header_id">ID</TableHead>
                    <TableHead className="cls_user_management_users_table_header_name">
                      Name
                    </TableHead>
                    <TableHead className="cls_user_management_users_table_header_email">
                      Email
                    </TableHead>
                    <TableHead className="cls_user_management_users_table_header_email_verified">
                      Email Verified
                    </TableHead>
                    <TableHead className="cls_user_management_users_table_header_is_active">
                      Active
                    </TableHead>
                    <TableHead className="cls_user_management_users_table_header_last_logon">
                      Last Logon
                    </TableHead>
                    <TableHead className="cls_user_management_users_table_header_created_at">
                      Created At
                    </TableHead>
                    <TableHead className="cls_user_management_users_table_header_actions text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="cls_user_management_users_table_body">
                  {users.length === 0 ? (
                    <TableRow className="cls_user_management_users_table_row_empty">
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow
                        key={user.id}
                        className="cls_user_management_users_table_row cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedUser(user);
                          setUserDetailDialogOpen(true);
                        }}
                      >
                        <TableCell className="cls_user_management_users_table_cell_profile_pic">
                          <Avatar className="cls_user_management_users_table_avatar h-8 w-8">
                            <AvatarImage
                              src={user.profile_picture_url || undefined}
                              alt={user.name ? `Profile picture of ${user.name}` : "Profile picture"}
                              className="cls_user_management_users_table_avatar_image"
                            />
                            <AvatarFallback className="cls_user_management_users_table_avatar_fallback bg-slate-200 text-slate-600 text-xs">
                              {getUserInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="cls_user_management_users_table_cell_id font-mono text-xs">
                          {user.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="cls_user_management_users_table_cell_name">
                          {user.name || "-"}
                        </TableCell>
                        <TableCell className="cls_user_management_users_table_cell_email">
                          {user.email_address}
                        </TableCell>
                        <TableCell className="cls_user_management_users_table_cell_email_verified">
                          {user.email_verified ? (
                            <span className="text-green-600">Yes</span>
                          ) : (
                            <span className="text-red-600">No</span>
                          )}
                        </TableCell>
                        <TableCell className="cls_user_management_users_table_cell_is_active">
                          {user.is_active ? (
                            <span className="text-green-600">Active</span>
                          ) : (
                            <span className="text-red-600">Inactive</span>
                          )}
                        </TableCell>
                        <TableCell className="cls_user_management_users_table_cell_last_logon">
                          {user.last_logon
                            ? new Date(user.last_logon).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell className="cls_user_management_users_table_cell_created_at">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell className="cls_user_management_users_table_cell_actions text-right">
                          <TooltipProvider>
                            <div
                              className="cls_user_management_users_table_actions flex items-center justify-end gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setAssignRolesDialogOpen(true);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="cls_user_management_users_table_action_assign_roles"
                                  >
                                    <UserPlus className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Assign Roles</p>
                                </TooltipContent>
                              </Tooltip>
                              {user.is_active && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setDeactivateDialogOpen(true);
                                      }}
                                      variant="outline"
                                      size="sm"
                                      className="cls_user_management_users_table_action_deactivate"
                                    >
                                      <UserX className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Deactivate</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setResetPasswordDialogOpen(true);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="cls_user_management_users_table_action_reset_password"
                                  >
                                    <KeyRound className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Reset Password</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
            </TabsContent>
          )}

          {/* Tab 2: Roles */}
          {showRolesTab && (
            <TabsContent value="roles" className="cls_user_management_tab_roles w-full">
          <RolesMatrix
            add_button_enabled={true}
            role_name_selection_enabled={false}
            onSave={(data) => {
              // Data is already saved by RolesMatrix component
              console.log("Roles saved:", data);
            }}
          />
            </TabsContent>
          )}

          {/* Tab 3: Permissions */}
          {showPermissionsTab && (
            <TabsContent value="permissions" className="cls_user_management_tab_permissions w-full">
          <div className="cls_user_management_permissions_container flex flex-col gap-4 w-full">
            {/* Header buttons */}
            <div className="cls_user_management_permissions_header flex items-center justify-between">
              <div className="cls_user_management_permissions_header_left flex items-center gap-2">
                <Button
                  onClick={() => setAddPermissionDialogOpen(true)}
                  variant="default"
                  size="sm"
                  className="cls_user_management_permissions_add_button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Permission
                </Button>
              </div>
              <div className="cls_user_management_permissions_header_right">
                <Button
                  onClick={handleMigratePermissions}
                  disabled={migrateLoading}
                  variant="default"
                  size="sm"
                  className="cls_user_management_permissions_migrate_button"
                >
                  {migrateLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    "Migrate config to database"
                  )}
                </Button>
              </div>
            </div>

            {/* Permissions table */}
            {permissionsLoading ? (
              <div className="cls_user_management_permissions_loading flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="cls_user_management_permissions_table_container border rounded-lg overflow-auto w-full">
                <Table className="cls_user_management_permissions_table w-full">
                  <TableHeader className="cls_user_management_permissions_table_header">
                    <TableRow className="cls_user_management_permissions_table_header_row">
                      <TableHead className="cls_user_management_permissions_table_header_name">
                        Permission Name
                      </TableHead>
                      <TableHead className="cls_user_management_permissions_table_header_description">
                        Description
                      </TableHead>
                      <TableHead className="cls_user_management_permissions_table_header_source">
                        Source
                      </TableHead>
                      <TableHead className="cls_user_management_permissions_table_header_actions text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="cls_user_management_permissions_table_body">
                    {permissions.length === 0 ? (
                      <TableRow className="cls_user_management_permissions_table_row_empty">
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No permissions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      permissions.map((permission) => (
                        <TableRow
                          key={`${permission.source}-${permission.id}-${permission.permission_name}`}
                          className="cls_user_management_permissions_table_row"
                        >
                          <TableCell
                            className={`cls_user_management_permissions_table_cell_name font-medium ${
                              permission.source === "db" ? "text-blue-600" : "text-purple-600"
                            }`}
                          >
                            {permission.permission_name}
                          </TableCell>
                          <TableCell className="cls_user_management_permissions_table_cell_description">
                            {permission.description || "-"}
                          </TableCell>
                          <TableCell className="cls_user_management_permissions_table_cell_source">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                permission.source === "db"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {permission.source === "db" ? "Database" : "Config"}
                            </span>
                          </TableCell>
                          <TableCell className="cls_user_management_permissions_table_cell_actions text-right">
                            <div className="cls_user_management_permissions_table_actions flex items-center justify-end gap-2">
                              {permission.source === "db" && (
                                <>
                                  <Button
                                    onClick={() => {
                                      setEditingPermission(permission);
                                      setEditDescription(permission.description);
                                      setEditPermissionDialogOpen(true);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="cls_user_management_permissions_table_action_edit"
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    onClick={() => handleDeletePermission(permission)}
                                    disabled={permissionsActionLoading}
                                    variant="outline"
                                    size="sm"
                                    className="cls_user_management_permissions_table_action_delete text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
            </TabsContent>
          )}

          {/* Tab 4: Scope Labels (HRBAC) */}
          {showScopeLabelsTab && (
            <TabsContent value="scope_labels" className="cls_user_management_tab_scope_labels w-full">
              <ScopeLabelsTab defaultOrg={defaultOrg} />
            </TabsContent>
          )}

          {/* Tab 5: Scope Hierarchy (HRBAC) */}
          {showScopeHierarchyTab && (
            <TabsContent value="scope_hierarchy" className="cls_user_management_tab_scope_hierarchy w-full">
              <ScopeHierarchyTab defaultOrg={defaultOrg} />
            </TabsContent>
          )}

          {/* Tab 6: User Scopes (HRBAC) */}
          {showUserScopesTab && (
            <TabsContent value="user_scopes" className="cls_user_management_tab_user_scopes w-full">
              <UserScopesTab />
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* Deactivate User Dialog */}
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent className="cls_user_management_deactivate_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate {selectedUser?.name || selectedUser?.email_address}? They will not be able to log in until reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="cls_user_management_deactivate_dialog_footer">
            <AlertDialogAction
              onClick={handleDeactivateUser}
              disabled={usersActionLoading}
              className="cls_user_management_deactivate_dialog_confirm"
            >
              {usersActionLoading ? (
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
                setDeactivateDialogOpen(false);
                setSelectedUser(null);
              }}
              className="cls_user_management_deactivate_dialog_cancel"
            >
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <AlertDialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <AlertDialogContent className="cls_user_management_reset_password_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              Send a password reset email to {selectedUser?.email_address}? They will receive a link to reset their password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="cls_user_management_reset_password_dialog_footer">
            <AlertDialogAction
              onClick={handleResetPassword}
              disabled={usersActionLoading}
              className="cls_user_management_reset_password_dialog_confirm"
            >
              {usersActionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Email"
              )}
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => {
                setResetPasswordDialogOpen(false);
                setSelectedUser(null);
              }}
              className="cls_user_management_reset_password_dialog_cancel"
            >
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Permission Dialog */}
      <Dialog open={editPermissionDialogOpen} onOpenChange={setEditPermissionDialogOpen}>
        <DialogContent className="cls_user_management_edit_permission_dialog">
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>
              Update the description for permission: {editingPermission?.permission_name}
            </DialogDescription>
          </DialogHeader>
          <div className="cls_user_management_edit_permission_dialog_content flex flex-col gap-4 py-4">
            <div className="cls_user_management_edit_permission_dialog_field flex flex-col gap-2">
              <Label htmlFor="permission_description" className="cls_user_management_edit_permission_dialog_label">
                Description
              </Label>
              <Input
                id="permission_description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter permission description"
                className="cls_user_management_edit_permission_dialog_input"
              />
            </div>
          </div>
          <DialogFooter className="cls_user_management_edit_permission_dialog_footer">
            <Button
              onClick={handleEditPermission}
              disabled={permissionsActionLoading}
              variant="default"
              className="cls_user_management_edit_permission_dialog_save"
            >
              {permissionsActionLoading ? (
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
                setEditPermissionDialogOpen(false);
                setEditingPermission(null);
                setEditDescription("");
              }}
              variant="outline"
              className="cls_user_management_edit_permission_dialog_cancel"
            >
              <CircleX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Permission Dialog */}
      <Dialog open={addPermissionDialogOpen} onOpenChange={setAddPermissionDialogOpen}>
        <DialogContent className="cls_user_management_add_permission_dialog">
          <DialogHeader>
            <DialogTitle>Add New Permission</DialogTitle>
            <DialogDescription>
              Create a new permission that can be assigned to roles.
            </DialogDescription>
          </DialogHeader>
          <div className="cls_user_management_add_permission_dialog_content flex flex-col gap-4 py-4">
            <div className="cls_user_management_add_permission_dialog_field flex flex-col gap-2">
              <Label htmlFor="new_permission_name" className="cls_user_management_add_permission_dialog_label">
                Permission Name *
              </Label>
              <Input
                id="new_permission_name"
                value={newPermissionName}
                onChange={(e) => setNewPermissionName(e.target.value)}
                placeholder="Enter permission name (e.g., READ_USERS)"
                className="cls_user_management_add_permission_dialog_input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddPermission();
                  }
                }}
              />
            </div>
            <div className="cls_user_management_add_permission_dialog_field flex flex-col gap-2">
              <Label htmlFor="new_permission_description" className="cls_user_management_add_permission_dialog_label">
                Description
              </Label>
              <Input
                id="new_permission_description"
                value={newPermissionDescription}
                onChange={(e) => setNewPermissionDescription(e.target.value)}
                placeholder="Enter permission description (optional)"
                className="cls_user_management_add_permission_dialog_input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddPermission();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter className="cls_user_management_add_permission_dialog_footer">
            <Button
              onClick={handleAddPermission}
              disabled={permissionsActionLoading || !newPermissionName.trim()}
              variant="default"
              className="cls_user_management_add_permission_dialog_save"
            >
              {permissionsActionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CircleCheck className="h-4 w-4 mr-2" />
                  Create Permission
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                setAddPermissionDialogOpen(false);
                setNewPermissionName("");
                setNewPermissionDescription("");
              }}
              variant="outline"
              className="cls_user_management_add_permission_dialog_cancel"
            >
              <CircleX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={userDetailDialogOpen} onOpenChange={setUserDetailDialogOpen}>
        <DialogContent className="cls_user_management_user_detail_dialog max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedUser?.name || selectedUser?.email_address}
            </DialogDescription>
          </DialogHeader>
          <div className="cls_user_management_user_detail_dialog_content flex flex-col gap-4 py-4">
            {selectedUser && (
              <div className="cls_user_management_user_detail_fields grid grid-cols-1 gap-4">
                {/* Profile Picture */}
                <div className="cls_user_management_user_detail_field_profile_pic flex flex-col gap-2">
                  <Label className="cls_user_management_user_detail_label font-semibold">
                    Profile Picture
                  </Label>
                  <div className="cls_user_management_user_detail_profile_pic_container flex items-center gap-4">
                    <Avatar className="cls_user_management_user_detail_avatar h-16 w-16">
                      <AvatarImage
                        src={selectedUser.profile_picture_url || undefined}
                        alt={selectedUser.name ? `Profile picture of ${selectedUser.name}` : "Profile picture"}
                        className="cls_user_management_user_detail_avatar_image"
                      />
                      <AvatarFallback className="cls_user_management_user_detail_avatar_fallback bg-slate-200 text-slate-600 text-lg">
                        {getUserInitials(selectedUser)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="cls_user_management_user_detail_profile_pic_info flex flex-col gap-1">
                      <span className="cls_user_management_user_detail_profile_pic_url text-sm text-muted-foreground">
                        {selectedUser.profile_picture_url || "No profile picture"}
                      </span>
                      <span className="cls_user_management_user_detail_profile_pic_source text-xs text-muted-foreground">
                        Source: {selectedUser.profile_source || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User ID */}
                <div className="cls_user_management_user_detail_field_id flex flex-col gap-2">
                  <Label className="cls_user_management_user_detail_label font-semibold">
                    User ID
                  </Label>
                  <div className="cls_user_management_user_detail_id_value font-mono text-sm bg-muted p-2 rounded">
                    {selectedUser.id}
                  </div>
                </div>

                {/* Name */}
                <div className="cls_user_management_user_detail_field_name flex flex-col gap-2">
                  <Label className="cls_user_management_user_detail_label font-semibold">
                    Name
                  </Label>
                  <div className="cls_user_management_user_detail_name_value text-sm">
                    {selectedUser.name || "-"}
                  </div>
                </div>

                {/* Email */}
                <div className="cls_user_management_user_detail_field_email flex flex-col gap-2">
                  <Label className="cls_user_management_user_detail_label font-semibold">
                    Email Address
                  </Label>
                  <div className="cls_user_management_user_detail_email_value text-sm">
                    {selectedUser.email_address}
                  </div>
                </div>

                {/* Email Verified */}
                <div className="cls_user_management_user_detail_field_email_verified flex flex-col gap-2">
                  <Label className="cls_user_management_user_detail_label font-semibold">
                    Email Verified
                  </Label>
                  <div className="cls_user_management_user_detail_email_verified_value">
                    {selectedUser.email_verified ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-red-600 font-medium">No</span>
                    )}
                  </div>
                </div>

                {/* Active Status */}
                <div className="cls_user_management_user_detail_field_is_active flex flex-col gap-2">
                  <Label className="cls_user_management_user_detail_label font-semibold">
                    Active Status
                  </Label>
                  <div className="cls_user_management_user_detail_is_active_value">
                    {selectedUser.is_active ? (
                      <span className="text-green-600 font-medium">Active</span>
                    ) : (
                      <span className="text-red-600 font-medium">Inactive</span>
                    )}
                  </div>
                </div>

                {/* Last Logon */}
                <div className="cls_user_management_user_detail_field_last_logon flex flex-col gap-2">
                  <Label className="cls_user_management_user_detail_label font-semibold">
                    Last Logon
                  </Label>
                  <div className="cls_user_management_user_detail_last_logon_value text-sm">
                    {selectedUser.last_logon ? (
                      <span className="font-medium">
                        {new Date(selectedUser.last_logon).toLocaleString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          timeZoneName: "short",
                        })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </div>
                </div>

                {/* Created At */}
                <div className="cls_user_management_user_detail_field_created_at flex flex-col gap-2">
                  <Label className="cls_user_management_user_detail_label font-semibold">
                    Created At
                  </Label>
                  <div className="cls_user_management_user_detail_created_at_value text-sm">
                    {selectedUser.created_at ? (
                      <span className="font-medium">
                        {new Date(selectedUser.created_at).toLocaleString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          timeZoneName: "short",
                        })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="cls_user_management_user_detail_dialog_footer">
            <Button
              onClick={() => setUserDetailDialogOpen(false)}
              variant="outline"
              className="cls_user_management_user_detail_dialog_close"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Roles Dialog */}
      <Dialog open={assignRolesDialogOpen} onOpenChange={setAssignRolesDialogOpen}>
        <DialogContent className="cls_user_management_assign_roles_dialog max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Roles to User</DialogTitle>
            <DialogDescription>
              Select roles to assign to {selectedUser?.name || selectedUser?.email_address}. 
              Check the roles you want to assign, then click Save.
            </DialogDescription>
          </DialogHeader>
          <div className="cls_user_management_assign_roles_dialog_content py-4">
            <RolesMatrix
              add_button_enabled={false}
              role_name_selection_enabled={true}
              permissions_read_only={true}
              show_save_cancel={true}
              user_id={selectedUser?.id}
              onSave={(data) => {
                // Data is already saved by RolesMatrix component
                console.log("User roles saved:", data);
                // Refresh users list to show updated roles
                void loadUsers();
                setAssignRolesDialogOpen(false);
                setSelectedUser(null);
              }}
              onCancel={() => {
                setAssignRolesDialogOpen(false);
                setSelectedUser(null);
              }}
              className="cls_user_management_assign_roles_matrix"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

