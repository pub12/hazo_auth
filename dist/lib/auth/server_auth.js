// file_description: server-side auth utilities for server components and pages
// section: imports
import { cookies } from "next/headers";
import { get_hazo_connect_instance } from "../hazo_connect_instance.server";
import { createCrudService } from "hazo_connect/server";
import { map_db_source_to_ui } from "../services/profile_picture_source_mapper";
import { get_cookie_name, BASE_COOKIE_NAMES } from "../cookies_config.server";
// section: functions
/**
 * Gets authenticated user in server components/pages
 * Uses Next.js cookies() function to read authentication cookies
 * @returns ServerAuthResult with user info or authenticated: false
 */
export async function get_server_auth_user() {
    var _a, _b;
    const cookie_store = await cookies();
    const user_id = (_a = cookie_store.get(get_cookie_name(BASE_COOKIE_NAMES.USER_ID))) === null || _a === void 0 ? void 0 : _a.value;
    const user_email = (_b = cookie_store.get(get_cookie_name(BASE_COOKIE_NAMES.USER_EMAIL))) === null || _b === void 0 ? void 0 : _b.value;
    if (!user_id || !user_email) {
        return { authenticated: false };
    }
    try {
        const hazoConnect = get_hazo_connect_instance();
        const users_service = createCrudService(hazoConnect, "hazo_users");
        const users = await users_service.findBy({
            id: user_id,
            email_address: user_email,
        });
        if (!Array.isArray(users) || users.length === 0) {
            return { authenticated: false };
        }
        const user = users[0];
        // Check if user is active (status must be 'ACTIVE')
        if (user.status !== "ACTIVE") {
            return { authenticated: false };
        }
        // Map database profile_source to UI representation
        const profile_source_db = user.profile_source;
        const profile_source_ui = profile_source_db ? map_db_source_to_ui(profile_source_db) : undefined;
        return {
            authenticated: true,
            user_id: user.id,
            email: user.email_address,
            name: user.name || undefined,
            email_verified: user.email_verified === true,
            is_active: user.status === "ACTIVE", // Derived from status column
            last_logon: user.last_logon || undefined,
            profile_picture_url: user.profile_picture_url || undefined,
            profile_source: profile_source_ui,
        };
    }
    catch (error) {
        return { authenticated: false };
    }
}
/**
 * Checks if user is authenticated in server components/pages (simple boolean check)
 * @returns true if authenticated, false otherwise
 */
export async function is_server_authenticated() {
    const result = await get_server_auth_user();
    return result.authenticated;
}
