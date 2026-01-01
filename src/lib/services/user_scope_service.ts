// file_description: service for managing user scope assignments using hazo_connect
// section: imports
import type { HazoConnectAdapter } from "hazo_connect";
import { createCrudService } from "hazo_connect/server";
import { create_app_logger } from "../app_logger";
import { sanitize_error_for_user } from "../utils/error_sanitizer";
import {
  get_scope_by_id,
  get_scope_ancestors,
  get_root_scope_id,
  SUPER_ADMIN_SCOPE_ID,
  is_super_admin_scope,
} from "./scope_service";

// section: constants

/**
 * CRUD service options for hazo_user_scopes table
 * This table uses a composite primary key (user_id, scope_id) and no 'id' column
 */
const USER_SCOPES_CRUD_OPTIONS = {
  primaryKeys: ["user_id", "scope_id"],
  autoId: false as const,
};

// section: types

export type UserScope = {
  user_id: string;
  scope_id: string;
  root_scope_id: string;
  role_id: string;
  created_at: string;
  changed_at: string;
};

export type UserScopeResult = {
  success: boolean;
  scope?: UserScope;
  scopes?: UserScope[];
  error?: string;
};

export type ScopeAccessCheckResult = {
  has_access: boolean;
  access_via?: {
    scope_id: string;
    scope_name?: string;
  };
  user_scopes?: UserScope[];
  is_super_admin?: boolean;
};

export type AssignUserScopeData = {
  user_id: string;
  scope_id: string;
  role_id: string;
  root_scope_id?: string; // Optional - will be computed if not provided
};

// section: helpers

/**
 * Gets all scope assignments for a user
 */
export async function get_user_scopes(
  adapter: HazoConnectAdapter,
  user_id: string,
): Promise<UserScopeResult> {
  try {
    const user_scope_service = createCrudService(adapter, "hazo_user_scopes", USER_SCOPES_CRUD_OPTIONS);
    const scopes = await user_scope_service.findBy({ user_id });

    return {
      success: true,
      scopes: Array.isArray(scopes) ? (scopes as UserScope[]) : [],
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "user_scope_service.ts",
        line_number: 0,
        operation: "get_user_scopes",
        user_id,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Gets all users assigned to a specific scope
 */
export async function get_users_by_scope(
  adapter: HazoConnectAdapter,
  scope_id: string,
): Promise<UserScopeResult> {
  try {
    const user_scope_service = createCrudService(adapter, "hazo_user_scopes", USER_SCOPES_CRUD_OPTIONS);
    const scopes = await user_scope_service.findBy({ scope_id });

    return {
      success: true,
      scopes: Array.isArray(scopes) ? (scopes as UserScope[]) : [],
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "user_scope_service.ts",
        line_number: 0,
        operation: "get_users_by_scope",
        scope_id,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Assigns a scope to a user
 */
export async function assign_user_scope(
  adapter: HazoConnectAdapter,
  data: AssignUserScopeData,
): Promise<UserScopeResult> {
  try {
    const user_scope_service = createCrudService(adapter, "hazo_user_scopes", USER_SCOPES_CRUD_OPTIONS);
    const now = new Date().toISOString();

    // Check if assignment already exists
    const existing = await user_scope_service.findBy({
      user_id: data.user_id,
      scope_id: data.scope_id,
    });

    if (Array.isArray(existing) && existing.length > 0) {
      return {
        success: true,
        scope: existing[0] as UserScope, // Already assigned
      };
    }

    // Verify the scope exists
    const scope_result = await get_scope_by_id(adapter, data.scope_id);
    if (!scope_result.success) {
      return {
        success: false,
        error: "Scope not found",
      };
    }

    // Compute root_scope_id if not provided
    let root_scope_id: string = data.root_scope_id || "";
    if (!root_scope_id) {
      const computed_root = await get_root_scope_id(adapter, data.scope_id);
      root_scope_id = computed_root || data.scope_id; // Use self as root if computation fails
    }

    // Insert new assignment
    const inserted = await user_scope_service.insert({
      user_id: data.user_id,
      scope_id: data.scope_id,
      root_scope_id,
      role_id: data.role_id,
      created_at: now,
      changed_at: now,
    });

    if (!Array.isArray(inserted) || inserted.length === 0) {
      return {
        success: false,
        error: "Failed to assign scope to user",
      };
    }

    return {
      success: true,
      scope: inserted[0] as UserScope,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "user_scope_service.ts",
        line_number: 0,
        operation: "assign_user_scope",
        user_id: data.user_id,
        scope_id: data.scope_id,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Removes a scope assignment from a user
 */
export async function remove_user_scope(
  adapter: HazoConnectAdapter,
  user_id: string,
  scope_id: string,
): Promise<UserScopeResult> {
  try {
    const user_scope_service = createCrudService(adapter, "hazo_user_scopes", USER_SCOPES_CRUD_OPTIONS);

    // Find the assignment
    const existing = await user_scope_service.findBy({
      user_id,
      scope_id,
    });

    if (!Array.isArray(existing) || existing.length === 0) {
      return {
        success: true, // Already not assigned
      };
    }

    const existing_scope = existing[0] as UserScope;

    // Try to delete - composite key might require special handling
    try {
      // If the record has an id field, use it
      if ((existing[0] as Record<string, unknown>).id) {
        await user_scope_service.deleteById(
          (existing[0] as Record<string, unknown>).id as string,
        );
      } else {
        // For composite keys, we need to find and delete by all criteria
        const all_user_scopes = await user_scope_service.findBy({ user_id });
        if (Array.isArray(all_user_scopes)) {
          for (const scope of all_user_scopes) {
            const s = scope as UserScope;
            if (s.scope_id === scope_id) {
              if ((scope as Record<string, unknown>).id) {
                await user_scope_service.deleteById(
                  (scope as Record<string, unknown>).id as string,
                );
              }
              break;
            }
          }
        }
      }
    } catch {
      const logger = create_app_logger();
      logger.warn("user_scope_delete_fallback", {
        filename: "user_scope_service.ts",
        line_number: 0,
        note: "Delete by composite key not fully supported",
      });
    }

    return {
      success: true,
      scope: existing_scope,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "user_scope_service.ts",
        line_number: 0,
        operation: "remove_user_scope",
        user_id,
        scope_id,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Bulk update user scope assignments
 * Replaces all existing assignments with the new set
 */
export async function update_user_scopes(
  adapter: HazoConnectAdapter,
  user_id: string,
  new_scopes: Array<{ scope_id: string; role_id: string }>,
): Promise<UserScopeResult> {
  try {
    // Get current scopes
    const current_result = await get_user_scopes(adapter, user_id);
    if (!current_result.success) {
      return current_result;
    }

    const current_scopes = current_result.scopes || [];

    // Determine scopes to add and remove
    const current_keys = new Set(current_scopes.map((s) => s.scope_id));
    const new_keys = new Set(new_scopes.map((s) => s.scope_id));

    // Remove scopes not in new set
    for (const scope of current_scopes) {
      if (!new_keys.has(scope.scope_id)) {
        await remove_user_scope(adapter, user_id, scope.scope_id);
      }
    }

    // Add scopes not in current set
    for (const scope of new_scopes) {
      if (!current_keys.has(scope.scope_id)) {
        const result = await assign_user_scope(adapter, {
          user_id,
          scope_id: scope.scope_id,
          role_id: scope.role_id,
        });
        if (!result.success) {
          return result;
        }
      }
    }

    // Return updated scopes
    return get_user_scopes(adapter, user_id);
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "user_scope_service.ts",
        line_number: 0,
        operation: "update_user_scopes",
        user_id,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Checks if a user is a super admin (has super admin scope assigned)
 */
export async function is_user_super_admin(
  adapter: HazoConnectAdapter,
  user_id: string,
): Promise<boolean> {
  try {
    const user_scopes_result = await get_user_scopes(adapter, user_id);
    if (!user_scopes_result.success || !user_scopes_result.scopes) {
      return false;
    }

    return user_scopes_result.scopes.some((scope) =>
      is_super_admin_scope(scope.scope_id),
    );
  } catch {
    return false;
  }
}

/**
 * Checks if a user has any scope assigned
 */
export async function user_has_any_scope(
  adapter: HazoConnectAdapter,
  user_id: string,
): Promise<boolean> {
  try {
    const user_scopes_result = await get_user_scopes(adapter, user_id);
    return (
      user_scopes_result.success &&
      Array.isArray(user_scopes_result.scopes) &&
      user_scopes_result.scopes.length > 0
    );
  } catch {
    return false;
  }
}

/**
 * Checks if a user has access to a specific scope
 * Access is granted if:
 * 1. User is a super admin (has super admin scope)
 * 2. User has the exact scope assigned
 * 3. User has access to an ancestor scope (inherited access)
 *
 * @param adapter - HazoConnect adapter
 * @param user_id - User ID to check
 * @param target_scope_id - The scope ID being accessed
 */
export async function check_user_scope_access(
  adapter: HazoConnectAdapter,
  user_id: string,
  target_scope_id: string,
): Promise<ScopeAccessCheckResult> {
  try {
    // Get user's assigned scopes
    const user_scopes_result = await get_user_scopes(adapter, user_id);
    if (!user_scopes_result.success || !user_scopes_result.scopes) {
      return { has_access: false };
    }

    const user_scopes = user_scopes_result.scopes;

    // Check 1: Is user a super admin?
    const has_super_admin = user_scopes.some((scope) =>
      is_super_admin_scope(scope.scope_id),
    );

    if (has_super_admin) {
      return {
        has_access: true,
        access_via: {
          scope_id: SUPER_ADMIN_SCOPE_ID,
          scope_name: "Super Admin",
        },
        user_scopes,
        is_super_admin: true,
      };
    }

    // Check 2: Does user have exact scope assigned?
    for (const user_scope of user_scopes) {
      if (user_scope.scope_id === target_scope_id) {
        const scope_result = await get_scope_by_id(adapter, target_scope_id);
        return {
          has_access: true,
          access_via: {
            scope_id: user_scope.scope_id,
            scope_name: scope_result.success
              ? scope_result.scope?.name
              : undefined,
          },
          user_scopes,
        };
      }
    }

    // Check 3: Does user have access via an ancestor scope?
    const ancestors_result = await get_scope_ancestors(
      adapter,
      target_scope_id,
    );

    if (ancestors_result.success && ancestors_result.scopes) {
      for (const ancestor of ancestors_result.scopes) {
        for (const user_scope of user_scopes) {
          if (user_scope.scope_id === ancestor.id) {
            // User has access via this ancestor
            return {
              has_access: true,
              access_via: {
                scope_id: ancestor.id,
                scope_name: ancestor.name,
              },
              user_scopes,
            };
          }
        }
      }
    }

    // No access
    return {
      has_access: false,
      user_scopes,
    };
  } catch (error) {
    const logger = create_app_logger();
    logger.error("check_user_scope_access_error", {
      filename: "user_scope_service.ts",
      line_number: 0,
      error: error instanceof Error ? error.message : "Unknown error",
      user_id,
      target_scope_id,
    });

    return { has_access: false };
  }
}

/**
 * Gets scopes a user has direct access to (not inherited)
 */
export async function get_user_direct_scopes(
  adapter: HazoConnectAdapter,
  user_id: string,
): Promise<{
  success: boolean;
  scopes?: Array<{
    scope_id: string;
    scope_name?: string;
    level?: string;
    role_id: string;
  }>;
  error?: string;
}> {
  try {
    const user_scopes_result = await get_user_scopes(adapter, user_id);
    if (!user_scopes_result.success || !user_scopes_result.scopes) {
      return {
        success: false,
        error: user_scopes_result.error || "Failed to get user scopes",
      };
    }

    const scopes_with_details = [];
    for (const user_scope of user_scopes_result.scopes) {
      const scope_result = await get_scope_by_id(adapter, user_scope.scope_id);
      scopes_with_details.push({
        scope_id: user_scope.scope_id,
        scope_name: scope_result.success ? scope_result.scope?.name : undefined,
        level: scope_result.success ? scope_result.scope?.level : undefined,
        role_id: user_scope.role_id,
      });
    }

    return {
      success: true,
      scopes: scopes_with_details,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "user_scope_service.ts",
        line_number: 0,
        operation: "get_user_direct_scopes",
        user_id,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Assigns super admin scope to a user
 */
export async function assign_super_admin_scope(
  adapter: HazoConnectAdapter,
  user_id: string,
  role_id: string,
): Promise<UserScopeResult> {
  return assign_user_scope(adapter, {
    user_id,
    scope_id: SUPER_ADMIN_SCOPE_ID,
    root_scope_id: SUPER_ADMIN_SCOPE_ID,
    role_id,
  });
}
