// file_description: internal reusable component for roles-permissions matrix with data table
// section: client_directive
"use client";

// section: imports
import { useState, useEffect, useMemo } from "react";
import { Button } from "../../../ui/button";
import { Checkbox } from "../../../ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Plus, Save, Loader2, CircleCheck, CircleX } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "../../../ui/avatar";

// section: types
export type RolesMatrixData = {
  roles: Array<{
    role_id?: number; // undefined for new roles
    role_name: string;
    selected: boolean; // if role_name_selection_enabled
    permissions: string[]; // permission names
  }>;
};

export type RolesMatrixProps = {
  add_button_enabled?: boolean;
  role_name_selection_enabled?: boolean;
  permissions_read_only?: boolean; // If true, permission checkboxes are disabled/read-only
  show_save_cancel?: boolean; // If true, show Save and Cancel buttons
  user_id?: string; // If provided, show user info and pre-check roles assigned to user
  onSave?: (data: RolesMatrixData) => void;
  onCancel?: () => void; // Callback when Cancel button is pressed
  onRoleSelection?: (role_id: number, role_name: string) => void; // Callback when a role is selected (for assignment mode)
  className?: string;
};

// section: component
/**
 * Roles matrix component - reusable internal component for roles-permissions matrix
 * Shows data table with permissions as columns and roles as rows
 * Checkboxes in cells indicate role-permission mappings
 * Changes are stored locally and only saved when Save button is pressed
 * @param props - Component props including button enable flags and save callback
 * @returns Roles matrix component
 */
export function RolesMatrix({
  add_button_enabled = true,
  role_name_selection_enabled = true,
  permissions_read_only = false,
  show_save_cancel = true,
  user_id,
  onSave,
  onCancel,
  onRoleSelection,
  className,
}: RolesMatrixProps) {
  const [roles, setRoles] = useState<Array<{
    role_id?: number;
    role_name: string;
    selected: boolean;
    permissions: Set<string>;
  }>>([]);
  const [originalRoles, setOriginalRoles] = useState<Array<{
    role_id?: number;
    role_name: string;
    selected: boolean;
    permissions: Set<string>;
  }>>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [userInfo, setUserInfo] = useState<{
    name: string | null;
    email_address: string;
    profile_picture_url: string | null;
  } | null>(null);
  const [userRoleIds, setUserRoleIds] = useState<number[]>([]);

  // Load roles and permissions on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load roles and permissions
        const roles_response = await fetch("/api/hazo_auth/user_management/roles");
        const roles_data = await roles_response.json();

        if (!roles_data.success) {
          toast.error("Failed to load roles and permissions");
          setLoading(false);
          return;
        }

        setPermissions(roles_data.permissions.map((p: { permission_name: string }) => p.permission_name));
        
        // Initialize roles with permissions as Sets
        const roles_with_permissions = roles_data.roles.map((role: {
          role_id: number;
          role_name: string;
          permissions: string[];
        }) => ({
          role_id: role.role_id,
          role_name: role.role_name,
          selected: false,
          permissions: new Set(role.permissions),
        }));

        // Store original state for cancel functionality
        const original_roles = roles_data.roles.map((role: {
          role_id: number;
          role_name: string;
          permissions: string[];
        }) => ({
          role_id: role.role_id,
          role_name: role.role_name,
          selected: false,
          permissions: new Set(role.permissions),
        }));

        // If user_id is provided, load user info and user roles
        if (user_id) {
          // Load user info
          const user_response = await fetch(`/api/hazo_auth/user_management/users?id=${user_id}`);
          const user_data = await user_response.json();

          if (user_data.success && Array.isArray(user_data.users) && user_data.users.length > 0) {
            const user = user_data.users[0];
            setUserInfo({
              name: user.name || null,
              email_address: user.email_address,
              profile_picture_url: user.profile_picture_url || null,
            });
          }

          // Load user roles
          const user_roles_response = await fetch(`/api/hazo_auth/user_management/users/roles?user_id=${user_id}`);
          const user_roles_data = await user_roles_response.json();

          if (user_roles_data.success && Array.isArray(user_roles_data.role_ids)) {
            setUserRoleIds(user_roles_data.role_ids);
            
            // Pre-check roles that are assigned to the user
            roles_with_permissions.forEach((role: {
              role_id?: number;
              role_name: string;
              selected: boolean;
              permissions: Set<string>;
            }) => {
              if (role.role_id !== undefined && user_roles_data.role_ids.includes(role.role_id)) {
                role.selected = true;
              }
            });
            
            // Also update original roles
            original_roles.forEach((role: {
              role_id?: number;
              role_name: string;
              selected: boolean;
              permissions: Set<string>;
            }) => {
              if (role.role_id !== undefined && user_roles_data.role_ids.includes(role.role_id)) {
                role.selected = true;
              }
            });
          }
        }

        setRoles(roles_with_permissions);
        setOriginalRoles(original_roles);
      } catch (error) {
        toast.error("Failed to load roles and permissions");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [user_id]);

  // Handle checkbox change for role-permission mapping
  const handlePermissionToggle = (role_index: number, permission_name: string) => {
    setRoles((prev) => {
      const updated = [...prev];
      const role = { ...updated[role_index] };
      const new_permissions = new Set(role.permissions);

      if (new_permissions.has(permission_name)) {
        new_permissions.delete(permission_name);
      } else {
        new_permissions.add(permission_name);
      }

      role.permissions = new_permissions;
      updated[role_index] = role;
      return updated;
    });
  };

  // Handle role name checkbox toggle
  const handleRoleSelectionToggle = (role_index: number) => {
    // Toggle selection state
    setRoles((prev) => {
      const updated = [...prev];
      const updated_role = { ...updated[role_index] };
      updated_role.selected = !updated_role.selected;
      updated[role_index] = updated_role;
      return updated;
    });
  };

  // Handle add role
  const handleAddRole = () => {
    if (!newRoleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    // Check if role name already exists
    if (roles.some((r) => r.role_name.toLowerCase() === newRoleName.trim().toLowerCase())) {
      toast.error("Role with this name already exists");
      return;
    }

    setRoles((prev) => [
      ...prev,
      {
        role_name: newRoleName.trim(),
        selected: false,
        permissions: new Set<string>(),
      },
    ]);

    setNewRoleName("");
    setIsAddDialogOpen(false);
    toast.success("Role added. Don't forget to save changes.");
  };

  // Handle cancel - reset to original database state
  const handleCancel = () => {
    // Deep clone original roles to reset state (this removes any newly added roles without role_id)
    const reset_roles = originalRoles.map((role) => ({
      role_id: role.role_id,
      role_name: role.role_name,
      selected: role.selected,
      permissions: new Set(role.permissions),
    }));
    setRoles(reset_roles);
    toast.info("Changes cancelled. State reset to database values.");
    
    // Call onCancel callback if provided (e.g., to close dialog)
    if (onCancel) {
      onCancel();
    }
  };

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert Sets to arrays for JSON serialization
      const roles_data: RolesMatrixData = {
        roles: roles.map((role) => ({
          role_id: role.role_id,
          role_name: role.role_name,
          selected: role.selected,
          permissions: Array.from(role.permissions),
        })),
      };

      // If user_id is provided, save user roles instead of role-permission mappings
      if (user_id) {
        // Get selected role IDs
        const selected_role_ids = roles
          .filter((role) => role.selected && role.role_id !== undefined)
          .map((role) => role.role_id as number);

        // Update user roles via API
        const response = await fetch("/api/hazo_auth/user_management/users/roles", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id,
            role_ids: selected_role_ids,
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success("User roles updated successfully");
          
          // Update original state to reflect saved changes
          const updated_original_roles = originalRoles.map((role) => ({
            ...role,
            selected: role.role_id !== undefined && selected_role_ids.includes(role.role_id),
          }));
          setOriginalRoles(updated_original_roles);
          setUserRoleIds(selected_role_ids);
        } else {
          toast.error(data.error || "Failed to update user roles");
        }
      } else {
        // Save role-permission mappings (original behavior)
        // Call onSave callback if provided
        if (onSave) {
          onSave(roles_data);
        }

        // Save to API
        const response = await fetch("/api/hazo_auth/user_management/roles", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(roles_data),
        });

        const data = await response.json();

        if (data.success) {
          toast.success("Roles and permissions saved successfully");
          
          // Reload data to get updated role IDs
          const reload_response = await fetch("/api/hazo_auth/user_management/roles");
          const reload_data = await reload_response.json();

          if (reload_data.success) {
            const updated_roles = reload_data.roles.map((role: {
              role_id: number;
              role_name: string;
              permissions: string[];
            }) => ({
              role_id: role.role_id,
              role_name: role.role_name,
              selected: false,
              permissions: new Set(role.permissions),
            }));

            // Update both current and original state after save
            setRoles(updated_roles);
            setOriginalRoles(updated_roles.map((r: {
              role_id?: number;
              role_name: string;
              selected: boolean;
              permissions: Set<string>;
            }) => ({
              role_id: r.role_id,
              role_name: r.role_name,
              selected: r.selected,
              permissions: new Set(r.permissions),
            })));
          }
        } else {
          toast.error(data.error || "Failed to save roles and permissions");
        }
      }
    } catch (error) {
      toast.error(user_id ? "Failed to update user roles" : "Failed to save roles and permissions");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`cls_roles_matrix flex items-center justify-center p-8 ${className || ""}`}>
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  // Helper function to get user initials
  const getUserInitials = (name: string | null, email: string): string => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`cls_roles_matrix flex flex-col gap-4 w-full ${className || ""}`}>
      {/* User Info Section - only show when user_id is provided */}
      {user_id && userInfo && (
        <div className="cls_roles_matrix_user_info flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
          <Avatar className="cls_roles_matrix_user_avatar h-12 w-12">
            <AvatarImage
              src={userInfo.profile_picture_url || undefined}
              alt={userInfo.name ? `Profile picture of ${userInfo.name}` : "Profile picture"}
              className="cls_roles_matrix_user_avatar_image"
            />
            <AvatarFallback className="cls_roles_matrix_user_avatar_fallback bg-slate-200 text-slate-600">
              {getUserInitials(userInfo.name, userInfo.email_address)}
            </AvatarFallback>
          </Avatar>
          <div className="cls_roles_matrix_user_info_details flex flex-col">
            <span className="cls_roles_matrix_user_name font-semibold text-lg">
              {userInfo.name || userInfo.email_address}
            </span>
            {userInfo.name && (
              <span className="cls_roles_matrix_user_email text-sm text-muted-foreground">
                {userInfo.email_address}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Header with Add Role button */}
      <div className="cls_roles_matrix_header flex items-center justify-between">
        <div className="cls_roles_matrix_header_left">
          {add_button_enabled && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              variant="default"
              size="sm"
              className="cls_roles_matrix_add_button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          )}
        </div>
      </div>

      {/* Data table */}
      <div className="cls_roles_matrix_table_container border rounded-lg overflow-auto w-full">
        <Table className="cls_roles_matrix_table w-full">
          <TableHeader className="cls_roles_matrix_table_header">
            <TableRow className="cls_roles_matrix_table_header_row">
              {role_name_selection_enabled && (
                <TableHead className="cls_roles_matrix_table_header_role_checkbox w-12">
                  {/* Empty header for role checkbox column */}
                </TableHead>
              )}
              <TableHead className="cls_roles_matrix_table_header_role_name">
                Role Name
              </TableHead>
              {permissions.map((permission_name) => (
                <TableHead
                  key={permission_name}
                  className="cls_roles_matrix_table_header_permission text-center"
                >
                  {permission_name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="cls_roles_matrix_table_body">
            {roles.length === 0 ? (
              <TableRow className="cls_roles_matrix_table_row_empty">
                <TableCell
                  colSpan={permissions.length + (role_name_selection_enabled ? 2 : 1)}
                  className="text-center text-muted-foreground py-8"
                >
                  No roles found. Add a role to get started.
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role, role_index) => (
                <TableRow key={role_index} className="cls_roles_matrix_table_row">
                  {role_name_selection_enabled && (
                    <TableCell className="cls_roles_matrix_table_cell_role_checkbox text-center">
                      <div className="cls_roles_matrix_role_checkbox_wrapper flex items-center justify-center">
                        <Checkbox
                          checked={role.selected}
                          onCheckedChange={() => handleRoleSelectionToggle(role_index)}
                          className="cls_roles_matrix_role_checkbox"
                        />
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="cls_roles_matrix_table_cell_role_name font-medium">
                    {role.role_name}
                  </TableCell>
                  {permissions.map((permission_name) => (
                    <TableCell
                      key={permission_name}
                      className="cls_roles_matrix_table_cell_permission text-center"
                    >
                      <div className="cls_roles_matrix_permission_checkbox_wrapper flex items-center justify-center">
                        <Checkbox
                          checked={role.permissions.has(permission_name)}
                          onCheckedChange={() => handlePermissionToggle(role_index, permission_name)}
                          disabled={permissions_read_only}
                          className="cls_roles_matrix_permission_checkbox"
                        />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer with Save and Cancel buttons - show based on show_save_cancel prop */}
      {show_save_cancel && (
        <div className="cls_roles_matrix_footer flex items-center justify-end gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="default"
            size="sm"
            className="cls_roles_matrix_save_button"
          >
            {saving ? (
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
            onClick={handleCancel}
            variant="outline"
            size="sm"
            className="cls_roles_matrix_cancel_button"
          >
            <CircleX className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}

      {/* Add Role Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="cls_roles_matrix_add_dialog">
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
            <DialogDescription>
              Enter a name for the new role. You can assign permissions after creating the role.
            </DialogDescription>
          </DialogHeader>
          <div className="cls_roles_matrix_add_dialog_content flex flex-col gap-4 py-4">
            <div className="cls_roles_matrix_add_dialog_field flex flex-col gap-2">
              <Label htmlFor="role_name" className="cls_roles_matrix_add_dialog_label">
                Role Name
              </Label>
              <Input
                id="role_name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Enter role name"
                className="cls_roles_matrix_add_dialog_input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddRole();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter className="cls_roles_matrix_add_dialog_footer">
            <Button
              onClick={handleAddRole}
              variant="default"
              className="cls_roles_matrix_add_dialog_save"
            >
              Add Role
            </Button>
            <Button
              onClick={() => {
                setIsAddDialogOpen(false);
                setNewRoleName("");
              }}
              variant="outline"
              className="cls_roles_matrix_add_dialog_cancel"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

