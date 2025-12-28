import { get_hazo_connect_instance } from "../hazo_connect_instance.server";
import { createCrudService } from "hazo_connect/server";
import { create_app_logger } from "../app_logger";
import { get_filename, get_line_number } from "../utils/api_route_helpers";
import { PermissionError, ScopeAccessError, OrgRequiredError } from "./auth_types";
import { get_auth_cache } from "./auth_cache";
import { get_scope_cache } from "./scope_cache";
import { get_rate_limiter } from "./auth_rate_limiter";
import { get_auth_utility_config } from "../auth_utility_config.server";
import { validate_session_token } from "../services/session_token_service";
import { is_hrbac_enabled, get_scope_hierarchy_config } from "../scope_hierarchy_config.server";
import { check_user_scope_access, get_user_scopes } from "../services/user_scope_service";
import { is_valid_scope_level } from "../services/scope_service";
import { is_multi_tenancy_enabled, get_multi_tenancy_config } from "../multi_tenancy_config.server";
import { get_org_cache } from "./org_cache";
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
    // Check if user is active
    if (user_db.is_active === false) {
        throw new Error("User is inactive");
    }
    // Build user object with base fields
    const user = {
        id: user_db.id,
        name: user_db.name || null,
        email_address: user_db.email_address,
        is_active: user_db.is_active === true,
        profile_picture_url: user_db.profile_picture_url || null,
        app_user_data: parse_app_user_data(user_db.app_user_data),
    };
    // Fetch org info if multi-tenancy is enabled and user has org_id
    if (is_multi_tenancy_enabled() && user_db.org_id) {
        const mt_config = get_multi_tenancy_config();
        const org_cache = get_org_cache(mt_config.org_cache_max_entries, mt_config.org_cache_ttl_minutes);
        const user_org_id = user_db.org_id;
        // Check org cache first
        let cached_org = org_cache.get(user_org_id);
        if (!cached_org) {
            // Fetch org info from database
            const org_service = createCrudService(hazoConnect, "hazo_org");
            const orgs = await org_service.findBy({ id: user_org_id });
            if (Array.isArray(orgs) && orgs.length > 0) {
                const org = orgs[0];
                const org_entry = {
                    org_id: org.id,
                    org_name: org.name,
                    parent_org_id: org.parent_org_id || null,
                    parent_org_name: null,
                    root_org_id: org.root_org_id || null,
                    root_org_name: null,
                };
                // Fetch parent org name if exists
                if (org_entry.parent_org_id) {
                    const parent_orgs = await org_service.findBy({ id: org_entry.parent_org_id });
                    if (Array.isArray(parent_orgs) && parent_orgs.length > 0) {
                        org_entry.parent_org_name = parent_orgs[0].name;
                    }
                }
                // Fetch root org name if exists
                if (org_entry.root_org_id) {
                    const root_orgs = await org_service.findBy({ id: org_entry.root_org_id });
                    if (Array.isArray(root_orgs) && root_orgs.length > 0) {
                        org_entry.root_org_name = root_orgs[0].name;
                    }
                }
                else if (user_db.root_org_id) {
                    // Fallback to user's root_org_id if org doesn't have one
                    const root_orgs = await org_service.findBy({ id: user_db.root_org_id });
                    if (Array.isArray(root_orgs) && root_orgs.length > 0) {
                        org_entry.root_org_id = root_orgs[0].id;
                        org_entry.root_org_name = root_orgs[0].name;
                    }
                }
                // Cache the org info
                org_cache.set(user_org_id, org_entry);
                cached_org = org_entry;
            }
        }
        // Add org info to user object
        if (cached_org) {
            user.org_id = cached_org.org_id;
            user.org_name = cached_org.org_name;
            user.parent_org_id = cached_org.parent_org_id;
            user.parent_org_name = cached_org.parent_org_name;
            user.root_org_id = cached_org.root_org_id;
            user.root_org_name = cached_org.root_org_name;
        }
    }
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
        scope_type: s.scope_type,
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
async function check_scope_access(user_id, scope_type, scope_id, scope_seq) {
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
    const result = await check_user_scope_access(hazoConnect, user_id, scope_type, scope_id, scope_seq);
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
export async function hazo_get_auth(request, options) {
    var _a, _b, _c;
    const logger = create_app_logger();
    const config = get_auth_utility_config();
    const cache = get_auth_cache(config.cache_max_users, config.cache_ttl_minutes, config.cache_max_age_minutes);
    const rate_limiter = get_rate_limiter();
    // Fast path: Check for authentication cookies
    // Priority: 1. JWT session token (new), 2. Simple cookies (backward compatibility)
    let user_id;
    let user_email;
    // Check for JWT session token first
    const session_token = (_a = request.cookies.get("hazo_auth_session")) === null || _a === void 0 ? void 0 : _a.value;
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
        user_id = (_b = request.cookies.get("hazo_auth_user_id")) === null || _b === void 0 ? void 0 : _b.value;
        user_email = (_c = request.cookies.get("hazo_auth_user_email")) === null || _c === void 0 ? void 0 : _c.value;
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
            throw new PermissionError(missing_permissions, permissions, options.required_permissions, friendly_message);
        }
    }
    // Check HRBAC scope access if enabled and scope options provided
    let scope_ok;
    let scope_access_via;
    const hrbac_enabled = is_hrbac_enabled();
    const has_scope_options = (options === null || options === void 0 ? void 0 : options.scope_type) && ((options === null || options === void 0 ? void 0 : options.scope_id) || (options === null || options === void 0 ? void 0 : options.scope_seq));
    if (hrbac_enabled && has_scope_options) {
        const scope_result = await check_scope_access(user.id, options.scope_type, options === null || options === void 0 ? void 0 : options.scope_id, options === null || options === void 0 ? void 0 : options.scope_seq);
        scope_ok = scope_result.scope_ok;
        scope_access_via = scope_result.scope_access_via;
        // Log scope denial if permission logging is enabled
        if (!scope_ok && config.log_permission_denials) {
            const client_ip = get_client_ip(request);
            logger.warn("auth_utility_scope_access_denied", {
                filename: get_filename(),
                line_number: get_line_number(),
                user_id: user.id,
                scope_type: options.scope_type,
                scope_id: options === null || options === void 0 ? void 0 : options.scope_id,
                scope_seq: options === null || options === void 0 ? void 0 : options.scope_seq,
                user_scopes: scope_result.user_scopes,
                ip: client_ip,
            });
        }
        // Throw error if strict mode and scope access denied
        if (!scope_ok && (options === null || options === void 0 ? void 0 : options.strict)) {
            throw new ScopeAccessError(options.scope_type, (options === null || options === void 0 ? void 0 : options.scope_id) || (options === null || options === void 0 ? void 0 : options.scope_seq) || "unknown", scope_result.user_scopes);
        }
    }
    // Check org requirement if specified (only when multi-tenancy is enabled)
    let org_ok;
    if ((options === null || options === void 0 ? void 0 : options.require_org) && is_multi_tenancy_enabled()) {
        org_ok = !!user.org_id;
        if (!org_ok) {
            // Log org requirement failure if permission logging is enabled
            if (config.log_permission_denials) {
                const client_ip = get_client_ip(request);
                logger.warn("auth_utility_org_required_missing", {
                    filename: get_filename(),
                    line_number: get_line_number(),
                    user_id: user.id,
                    ip: client_ip,
                });
            }
            // Always throw error when org is required but missing
            throw new OrgRequiredError(user.id);
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
        org_ok,
    };
}
