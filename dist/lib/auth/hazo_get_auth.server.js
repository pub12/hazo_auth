import { get_hazo_connect_instance } from "../hazo_connect_instance.server";
import { createCrudService } from "hazo_connect/server";
import { create_app_logger } from "../app_logger";
import { get_filename, get_line_number } from "../utils/api_route_helpers";
import { PermissionError, ScopeAccessError } from "./auth_types";
import { get_auth_cache } from "./auth_cache";
import { get_scope_cache } from "./scope_cache";
import { get_rate_limiter } from "./auth_rate_limiter";
import { get_auth_utility_config } from "../auth_utility_config.server";
import { validate_session_token } from "../services/session_token_service";
import { is_hrbac_enabled, get_scope_hierarchy_config } from "../scope_hierarchy_config.server";
import { check_user_scope_access, get_user_scopes, } from "../services/user_scope_service";
import { get_cookie_name, BASE_COOKIE_NAMES } from "../cookies_config.server";
import { get_app_permission_descriptions } from "../app_permissions_config.server";
// section: helpers
/**
 * Parse JSON string to object, returning null on failure
 * @param json_string - JSON string to parse
 * @returns Parsed object or null
 */
function parse_app_user_data(json_string) {
    if (json_string === null || json_string === undefined || json_string === "") {
        return null;
    }
    if (typeof json_string !== "string") {
        return null;
    }
    try {
        const parsed = JSON.parse(json_string);
        if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
            return parsed;
        }
        return null;
    }
    catch (_a) {
        return null;
    }
}
/**
 * Gets client IP address from request
 * @param request - NextRequest object
 * @returns IP address string
 */
function get_client_ip(request) {
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
async function fetch_user_data_from_db(user_id) {
    const hazoConnect = get_hazo_connect_instance();
    const users_service = createCrudService(hazoConnect, "hazo_users");
    const user_roles_service = createCrudService(hazoConnect, "hazo_user_roles");
    const role_permissions_service = createCrudService(hazoConnect, "hazo_role_permissions");
    const permissions_service = createCrudService(hazoConnect, "hazo_permissions");
    // Fetch user
    const users = await users_service.findBy({ id: user_id });
    if (!Array.isArray(users) || users.length === 0) {
        throw new Error("User not found");
    }
    const user_db = users[0];
    // Check if user is active (status must be 'active')
    if (user_db.status !== "active") {
        throw new Error("User is inactive");
    }
    // Build user object
    const user = {
        id: user_db.id,
        name: user_db.name || null,
        email_address: user_db.email_address,
        is_active: user_db.status === "active", // Derived from status column
        profile_picture_url: user_db.profile_picture_url || null,
        app_user_data: parse_app_user_data(user_db.app_user_data),
    };
    // Fetch user roles
    const user_roles = await user_roles_service.findBy({ user_id });
    const role_ids = [];
    if (Array.isArray(user_roles)) {
        for (const ur of user_roles) {
            const role_id = ur.role_id;
            if (role_id !== undefined) {
                role_ids.push(role_id);
            }
        }
    }
    // Fetch role permissions
    const permissions_set = new Set();
    if (role_ids.length > 0) {
        const role_permissions = await role_permissions_service.findBy({});
        if (Array.isArray(role_permissions)) {
            // Filter role_permissions for user's roles
            const user_role_permissions = role_permissions.filter((rp) => role_ids.includes(rp.role_id));
            // Get permission IDs
            const permission_ids = new Set();
            for (const rp of user_role_permissions) {
                const perm_id = rp.permission_id;
                if (perm_id !== undefined) {
                    permission_ids.add(perm_id);
                }
            }
            // Fetch permission names
            if (permission_ids.size > 0) {
                const permissions = await permissions_service.findBy({});
                if (Array.isArray(permissions)) {
                    for (const perm of permissions) {
                        const perm_id = perm.id;
                        if (perm_id !== undefined && permission_ids.has(perm_id)) {
                            const perm_name = perm.permission_name;
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
function check_permissions(user_permissions, required_permissions) {
    const user_perms_set = new Set(user_permissions);
    const missing = required_permissions.filter((perm) => !user_perms_set.has(perm));
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
function get_friendly_error_message(missing_permissions, config) {
    if (!config.enable_friendly_error_messages) {
        return undefined;
    }
    // Try to get messages for each missing permission
    const messages = [];
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
async function get_user_scopes_cached(user_id) {
    const scope_config = get_scope_hierarchy_config();
    const scope_cache = get_scope_cache(scope_config.scope_cache_max_entries, scope_config.scope_cache_ttl_minutes);
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
    const scopes = result.scopes.map((s) => ({
        scope_id: s.scope_id,
        root_scope_id: s.root_scope_id,
        role_id: s.role_id,
    }));
    scope_cache.set(user_id, scopes);
    return scopes;
}
/**
 * Checks if user has access to a specific scope
 * @param user_id - User ID
 * @param scope_id - Scope ID to check access for
 * @returns Object with scope_ok and access_via info
 */
async function check_scope_access_internal(user_id, scope_id) {
    const hazoConnect = get_hazo_connect_instance();
    const result = await check_user_scope_access(hazoConnect, user_id, scope_id);
    const user_scopes = (result.user_scopes || []).map((s) => ({
        scope_id: s.scope_id,
    }));
    if (result.has_access && result.access_via) {
        return {
            scope_ok: true,
            scope_access_via: {
                scope_id: result.access_via.scope_id,
                scope_name: result.access_via.scope_name,
                is_super_admin: result.is_super_admin,
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
 * Optionally checks scope access when scope_id option is provided
 * @param request - NextRequest object
 * @param options - Optional parameters for permission checking and scope checking
 * @returns HazoAuthResult with user data, permissions, and optional scope access info
 * @throws PermissionError if strict mode and permissions are missing
 * @throws ScopeAccessError if strict mode and scope access is denied
 */
export async function hazo_get_auth(request, options) {
    var _a, _b, _c;
    const logger = create_app_logger();
    const config = get_auth_utility_config();
    const cache = get_auth_cache(config.cache_max_users, config.cache_ttl_minutes, config.cache_max_age_minutes);
    const rate_limiter = get_rate_limiter();
    // Fast path: Check for authentication cookies (with configurable prefix)
    // Priority: 1. JWT session token (new), 2. Simple cookies (backward compatibility)
    let user_id;
    let user_email;
    // Check for JWT session token first
    const session_token = (_a = request.cookies.get(get_cookie_name(BASE_COOKIE_NAMES.SESSION))) === null || _a === void 0 ? void 0 : _a.value;
    if (session_token) {
        try {
            const token_result = await validate_session_token(session_token);
            if (token_result.valid && token_result.user_id && token_result.email) {
                user_id = token_result.user_id;
                user_email = token_result.email;
            }
        }
        catch (token_error) {
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
        user_id = (_b = request.cookies.get(get_cookie_name(BASE_COOKIE_NAMES.USER_ID))) === null || _b === void 0 ? void 0 : _b.value;
        user_email = (_c = request.cookies.get(get_cookie_name(BASE_COOKIE_NAMES.USER_EMAIL))) === null || _c === void 0 ? void 0 : _c.value;
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
    let user;
    let permissions;
    let role_ids;
    if (cached_entry) {
        // Cache hit
        user = cached_entry.user;
        permissions = cached_entry.permissions;
        role_ids = cached_entry.role_ids;
    }
    else {
        // Cache miss - fetch from database
        try {
            const user_data = await fetch_user_data_from_db(user_id);
            user = user_data.user;
            permissions = user_data.permissions;
            role_ids = user_data.role_ids;
            // Update cache
            cache.set(user_id, user, permissions, role_ids);
        }
        catch (error) {
            const error_message = error instanceof Error ? error.message : "Unknown error";
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
    let missing_permissions;
    if ((options === null || options === void 0 ? void 0 : options.required_permissions) && options.required_permissions.length > 0) {
        const check_result = check_permissions(permissions, options.required_permissions);
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
            const friendly_message = get_friendly_error_message(missing_permissions, config);
            // Include permission descriptions for debugging
            const permission_descriptions = get_app_permission_descriptions(missing_permissions);
            throw new PermissionError(missing_permissions, permissions, options.required_permissions, friendly_message, permission_descriptions);
        }
    }
    // Check scope access if enabled and scope_id provided
    let scope_ok;
    let scope_access_via;
    const hrbac_enabled = is_hrbac_enabled();
    if (hrbac_enabled && (options === null || options === void 0 ? void 0 : options.scope_id)) {
        const scope_result = await check_scope_access_internal(user.id, options.scope_id);
        scope_ok = scope_result.scope_ok;
        scope_access_via = scope_result.scope_access_via;
        // Log scope denial if permission logging is enabled
        if (!scope_ok && config.log_permission_denials) {
            const client_ip = get_client_ip(request);
            logger.warn("auth_utility_scope_access_denied", {
                filename: get_filename(),
                line_number: get_line_number(),
                user_id: user.id,
                scope_id: options.scope_id,
                user_scopes: scope_result.user_scopes,
                ip: client_ip,
            });
        }
        // Throw error if strict mode and scope access denied
        if (!scope_ok && options.strict) {
            throw new ScopeAccessError(options.scope_id, scope_result.user_scopes);
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
