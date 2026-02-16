// file_description: Built-in admin permission name constants for hazo_auth
// These are the permission names required by UserManagementLayout and other admin components.

// section: permission_constants
export const HAZO_AUTH_PERMISSIONS = {
  ADMIN_USER_MANAGEMENT: "admin_user_management",
  ADMIN_ROLE_MANAGEMENT: "admin_role_management",
  ADMIN_PERMISSION_MANAGEMENT: "admin_permission_management",
  ADMIN_SCOPE_HIERARCHY_MANAGEMENT: "admin_scope_hierarchy_management",
  ADMIN_USER_SCOPE_ASSIGNMENT: "admin_user_scope_assignment",
  ADMIN_SYSTEM: "admin_system",
  ADMIN_TEST_ACCESS: "admin_test_access",
} as const;

export const ALL_ADMIN_PERMISSIONS: string[] = Object.values(HAZO_AUTH_PERMISSIONS);
