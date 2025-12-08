// file_description: server-side implementation of hazo_get_auth utility for API routes
// section: imports
import { NextRequest } from "next/server";
import { get_hazo_connect_instance } from "../hazo_connect_instance.server";
import { createCrudService } from "hazo_connect/server";
import { create_app_logger } from "../app_logger";
import { get_filename, get_line_number } from "../utils/api_route_helpers";
import type { HazoAuthResult, HazoAuthUser, HazoAuthOptions, ScopeAccessInfo } from "./auth_types";
import { PermissionError, ScopeAccessError } from "./auth_types";
import { get_auth_cache } from "./auth_cache";
import { get_scope_cache, type UserScopeEntry } from "./scope_cache";
import { get_rate_limiter } from "./auth_rate_limiter";
import { get_auth_utility_config } from "../auth_utility_config.server";
import { validate_session_token } from "../services/session_token_service";
import { is_hrbac_enabled, get_scope_hierarchy_config } from "../scope_hierarchy_config.server";
import { check_user_scope_access, get_user_scopes, type UserScope } from "../services/user_scope_service";
import { is_valid_scope_level, type ScopeLevel } from "../services/scope_service";

// section: helpers

/**
 * Gets client IP address from request
 * @param request - NextRequest object
 * @returns IP address string
 */
function get_client_ip(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const real_ip = request.headers.get("x-real-ip");
  if (real_ip) {
    return real_ip;
  }
  return "unknown";
}

/**
 * Fetches user data and permissions from database
 * @param user_id - User ID
 * @returns Object with user, permissions, and role_ids
 */
async function fetch_user_data_from_db(user_id: string): Promise<{
  user: HazoAuthUser;
  permissions: string[];
  role_ids: number[];
}> {
  const hazoConnect = get_hazo_connect_instance();
  const users_service = createCrudService(hazoConnect, "hazo_users");
  const user_roles_service = createCrudService(hazoConnect, "hazo_user_roles");
  const role_permissions_service = createCrudService(
    hazoConnect,
    "hazo_role_permissions",
  );
  const permissions_service = createCrudService(
    hazoConnect,
    "hazo_permissions",
  );

  // Fetch user
  const users = await users_service.findBy({ id: user_id });
  if (!Array.isArray(users) || users.length === 0) {
    throw new Error("User not found");
  }

  const user_db = users[0];

  // Check if user is active
  if (user_db.is_active === false) {
    throw new Error("User is inactive");
  }

  // Build user object
  const user: HazoAuthUser = {
    id: user_db.id as string,
    name: (user_db.name as string | null) || null,
    email_address: user_db.email_address as string,
    is_active: user_db.is_active === true,
    profile_picture_url:
      (user_db.profile_picture_url as string | null) || null,
  };

  // Fetch user roles
  const user_roles = await user_roles_service.findBy({ user_id });
  const role_ids: number[] = [];
  if (Array.isArray(user_roles)) {
    for (const ur of user_roles) {
      const role_id = ur.role_id as number | undefined;
      if (role_id !== undefined) {
        role_ids.push(role_id);
      }
    }
  }

  // Fetch role permissions
  const permissions_set = new Set<string>();
  if (role_ids.length > 0) {
    const role_permissions = await role_permissions_service.findBy({});
    if (Array.isArray(role_permissions)) {
      // Filter role_permissions for user's roles
      const user_role_permissions = role_permissions.filter((rp) =>
        role_ids.includes(rp.role_id as number),
      );

      // Get permission IDs
      const permission_ids = new Set<number>();
      for (const rp of user_role_permissions) {
        const perm_id = rp.permission_id as number | undefined;
        if (perm_id !== undefined) {
          permission_ids.add(perm_id);
        }
      }

      // Fetch permission names
      if (permission_ids.size > 0) {
        const permissions = await permissions_service.findBy({});
        if (Array.isArray(permissions)) {
          for (const perm of permissions) {
            const perm_id = perm.id as number | undefined;
            if (perm_id !== undefined && permission_ids.has(perm_id)) {
              const perm_name = perm.permission_name as string | undefined;
              if (perm_name) {
                permissions_set.add(perm_name);
              }
            }
          }
        }
      }
    }
  }

  const permissions = Array.from(permissions_set);

  return { user, permissions, role_ids };
}

/**
 * Checks if user has required permissions
 * @param user_permissions - User's permissions
 * @param required_permissions - Required permissions
 * @returns Object with permission_ok and missing_permissions
 */
function check_permissions(
  user_permissions: string[],
  required_permissions: string[],
): { permission_ok: boolean; missing_permissions: string[] } {
  const user_perms_set = new Set(user_permissions);
  const missing = required_permissions.filter(
    (perm) => !user_perms_set.has(perm),
  );

  return {
    permission_ok: missing.length === 0,
    missing_permissions: missing,
  };
}

/**
 * Gets user-friendly error message for missing permissions
 * @param missing_permissions - Array of missing permission names
 * @param config - Auth utility config
 * @returns User-friendly message or undefined
 */
function get_friendly_error_message(
  missing_permissions: string[],
  config: ReturnType<typeof get_auth_utility_config>,
): string | undefined {
  if (!config.enable_friendly_error_messages) {
    return undefined;
  }

  // Try to get messages for each missing permission
  const messages: string[] = [];
  for (const perm of missing_permissions) {
    const message = config.permission_error_messages.get(perm);
    if (message) {
      messages.push(message);
    }
  }

  if (messages.length > 0) {
    return messages.join(". ");
  }

  // Default message if no specific mapping
  return "You don't have the required permissions to perform this action. Please contact your administrator.";
}

/**
 * Gets user scopes with caching
 * @param user_id - User ID
 * @returns Array of user scope entries
 */
async function get_user_scopes_cached(user_id: string): Promise<UserScopeEntry[]> {
  const scope_config = get_scope_hierarchy_config();
  const scope_cache = get_scope_cache(
    scope_config.scope_cache_max_entries,
    scope_config.scope_cache_ttl_minutes,
  );

  // Check cache
  const cached = scope_cache.get(user_id);
  if (cached) {
    return cached.scopes;
  }

  // Fetch from database
  const hazoConnect = get_hazo_connect_instance();
  const result = await get_user_scopes(hazoConnect, user_id);

  if (!result.success || !result.scopes) {
    return [];
  }

  // Convert to cache entry format and cache
  const scopes: UserScopeEntry[] = result.scopes.map((s: UserScope) => ({
    scope_type: s.scope_type as ScopeLevel,
    scope_id: s.scope_id,
    scope_seq: s.scope_seq,
  }));

  scope_cache.set(user_id, scopes);

  return scopes;
}

/**
 * Checks if user has access to a specific scope
 * @param user_id - User ID
 * @param scope_type - Scope level
 * @param scope_id - Scope ID (optional)
 * @param scope_seq - Scope seq (optional)
 * @returns Object with scope_ok and access_via info
 */
async function check_scope_access(
  user_id: string,
  scope_type: string,
  scope_id?: string,
  scope_seq?: string,
): Promise<{
  scope_ok: boolean;
  scope_access_via?: ScopeAccessInfo;
  user_scopes: Array<{ scope_type: string; scope_id: string; scope_seq: string }>;
}> {
  const logger = create_app_logger();

  // Validate scope_type
  if (!is_valid_scope_level(scope_type)) {
    logger.warn("auth_utility_invalid_scope_type", {
      filename: get_filename(),
      line_number: get_line_number(),
      scope_type,
      user_id,
    });
    return { scope_ok: false, user_scopes: [] };
  }

  const hazoConnect = get_hazo_connect_instance();
  const result = await check_user_scope_access(
    hazoConnect,
    user_id,
    scope_type as ScopeLevel,
    scope_id,
    scope_seq,
  );

  const user_scopes = (result.user_scopes || []).map((s) => ({
    scope_type: s.scope_type,
    scope_id: s.scope_id,
    scope_seq: s.scope_seq,
  }));

  if (result.has_access && result.access_via) {
    return {
      scope_ok: true,
      scope_access_via: {
        scope_type: result.access_via.scope_type,
        scope_id: result.access_via.scope_id,
        scope_seq: result.access_via.scope_seq,
      },
      user_scopes,
    };
  }

  return { scope_ok: false, user_scopes };
}

// section: main_function

/**
 * Main hazo_get_auth function for server-side use in API routes
 * Returns user details, permissions, and checks required permissions
 * Optionally checks HRBAC scope access when scope options are provided
 * @param request - NextRequest object
 * @param options - Optional parameters for permission checking and HRBAC scope checking
 * @returns HazoAuthResult with user data, permissions, and optional scope access info
 * @throws PermissionError if strict mode and permissions are missing
 * @throws ScopeAccessError if strict mode and scope access is denied
 */
export async function hazo_get_auth(
  request: NextRequest,
  options?: HazoAuthOptions,
): Promise<HazoAuthResult> {
  const logger = create_app_logger();
  const config = get_auth_utility_config();
  const cache = get_auth_cache(
    config.cache_max_users,
    config.cache_ttl_minutes,
    config.cache_max_age_minutes,
  );
  const rate_limiter = get_rate_limiter();

  // Fast path: Check for authentication cookies
  // Priority: 1. JWT session token (new), 2. Simple cookies (backward compatibility)
  let user_id: string | undefined;
  let user_email: string | undefined;
  
  // Check for JWT session token first
  const session_token = request.cookies.get("hazo_auth_session")?.value;
  if (session_token) {
    try {
      const token_result = await validate_session_token(session_token);
      if (token_result.valid && token_result.user_id && token_result.email) {
        user_id = token_result.user_id;
        user_email = token_result.email;
      }
    } catch (token_error) {
      // If token validation fails, fall back to simple cookies
      const token_error_message = token_error instanceof Error ? token_error.message : "Unknown error";
      logger.debug("auth_utility_jwt_validation_failed", {
        filename: get_filename(),
        line_number: get_line_number(),
        error: token_error_message,
        note: "Falling back to simple cookie check",
      });
    }
  }
  
  // Fall back to simple cookies if JWT not present or invalid (backward compatibility)
  if (!user_id || !user_email) {
    user_id = request.cookies.get("hazo_auth_user_id")?.value;
    user_email = request.cookies.get("hazo_auth_user_email")?.value;
  }

  if (!user_id || !user_email) {
    // Unauthenticated - check rate limit by IP
    const client_ip = get_client_ip(request);
    const ip_key = `ip:${client_ip}`;
    if (!rate_limiter.check(ip_key, config.rate_limit_per_ip)) {
      logger.warn("auth_utility_rate_limit_exceeded_ip", {
        filename: get_filename(),
        line_number: get_line_number(),
        ip: client_ip,
      });
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    return {
      authenticated: false,
      user: null,
      permissions: [],
      permission_ok: false,
    };
  }

  // Authenticated - check rate limit by user
  const user_key = `user:${user_id}`;
  if (!rate_limiter.check(user_key, config.rate_limit_per_user)) {
    logger.warn("auth_utility_rate_limit_exceeded_user", {
      filename: get_filename(),
      line_number: get_line_number(),
      user_id,
    });
    throw new Error("Rate limit exceeded. Please try again later.");
  }

  // Check cache
  let cached_entry = cache.get(user_id);
  let user: HazoAuthUser;
  let permissions: string[];
  let role_ids: number[];

  if (cached_entry) {
    // Cache hit
    user = cached_entry.user;
    permissions = cached_entry.permissions;
    role_ids = cached_entry.role_ids;
  } else {
    // Cache miss - fetch from database
    try {
      const user_data = await fetch_user_data_from_db(user_id);
      user = user_data.user;
      permissions = user_data.permissions;
      role_ids = user_data.role_ids;

      // Update cache
      cache.set(user_id, user, permissions, role_ids);
    } catch (error) {
      const error_message =
        error instanceof Error ? error.message : "Unknown error";
      logger.error("auth_utility_fetch_user_failed", {
        filename: get_filename(),
        line_number: get_line_number(),
        user_id,
        error: error_message,
      });

      return {
        authenticated: false,
        user: null,
        permissions: [],
        permission_ok: false,
      };
    }
  }

  // Check permissions if required
  let permission_ok = true;
  let missing_permissions: string[] | undefined;

  if (options?.required_permissions && options.required_permissions.length > 0) {
    const check_result = check_permissions(
      permissions,
      options.required_permissions,
    );
    permission_ok = check_result.permission_ok;
    missing_permissions = check_result.missing_permissions;

    // Log permission denial if enabled
    if (!permission_ok && config.log_permission_denials) {
      const client_ip = get_client_ip(request);
      logger.warn("auth_utility_permission_denied", {
        filename: get_filename(),
        line_number: get_line_number(),
        user_id,
        requested_permissions: options.required_permissions,
        missing_permissions,
        user_permissions: permissions,
        ip: client_ip,
      });
    }

    // Throw error if strict mode
    if (!permission_ok && options.strict) {
      const friendly_message = get_friendly_error_message(
        missing_permissions,
        config,
      );

      throw new PermissionError(
        missing_permissions,
        permissions,
        options.required_permissions,
        friendly_message,
      );
    }
  }

  // Check HRBAC scope access if enabled and scope options provided
  let scope_ok: boolean | undefined;
  let scope_access_via: ScopeAccessInfo | undefined;

  const hrbac_enabled = is_hrbac_enabled();
  const has_scope_options = options?.scope_type && (options?.scope_id || options?.scope_seq);

  if (hrbac_enabled && has_scope_options) {
    const scope_result = await check_scope_access(
      user.id,
      options!.scope_type!,
      options?.scope_id,
      options?.scope_seq,
    );

    scope_ok = scope_result.scope_ok;
    scope_access_via = scope_result.scope_access_via;

    // Log scope denial if permission logging is enabled
    if (!scope_ok && config.log_permission_denials) {
      const client_ip = get_client_ip(request);
      logger.warn("auth_utility_scope_access_denied", {
        filename: get_filename(),
        line_number: get_line_number(),
        user_id: user.id,
        scope_type: options!.scope_type,
        scope_id: options?.scope_id,
        scope_seq: options?.scope_seq,
        user_scopes: scope_result.user_scopes,
        ip: client_ip,
      });
    }

    // Throw error if strict mode and scope access denied
    if (!scope_ok && options?.strict) {
      throw new ScopeAccessError(
        options!.scope_type!,
        options?.scope_id || options?.scope_seq || "unknown",
        scope_result.user_scopes,
      );
    }
  }

  return {
    authenticated: true,
    user,
    permissions,
    permission_ok,
    missing_permissions,
    scope_ok,
    scope_access_via,
  };
}

