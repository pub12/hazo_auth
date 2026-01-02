// file_description: server-side auth utilities for server components and pages
// section: imports
import { cookies } from "next/headers";
import { get_hazo_connect_instance } from "../hazo_connect_instance.server";
import { createCrudService } from "hazo_connect/server";
import { map_db_source_to_ui } from "../services/profile_picture_source_mapper";
import { get_cookie_name, BASE_COOKIE_NAMES } from "../cookies_config.server";

// section: types
export type ServerAuthUser = {
  authenticated: true;
  user_id: string;
  email: string;
  name?: string;
  email_verified: boolean;
  is_active: boolean;
  last_logon?: string;
  profile_picture_url?: string;
  profile_source?: "upload" | "library" | "gravatar" | "custom";
};

export type ServerAuthResult = 
  | ServerAuthUser
  | { authenticated: false };

// section: functions
/**
 * Gets authenticated user in server components/pages
 * Uses Next.js cookies() function to read authentication cookies
 * @returns ServerAuthResult with user info or authenticated: false
 */
export async function get_server_auth_user(): Promise<ServerAuthResult> {
  const cookie_store = await cookies();
  const user_id = cookie_store.get(get_cookie_name(BASE_COOKIE_NAMES.USER_ID))?.value;
  const user_email = cookie_store.get(get_cookie_name(BASE_COOKIE_NAMES.USER_EMAIL))?.value;

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
    const profile_source_db = user.profile_source as string | null | undefined;
    const profile_source_ui = profile_source_db ? map_db_source_to_ui(profile_source_db) : undefined;

    return {
      authenticated: true,
      user_id: user.id as string,
      email: user.email_address as string,
      name: (user.name as string | null | undefined) || undefined,
      email_verified: user.email_verified === true,
      is_active: user.status === "ACTIVE", // Derived from status column
      last_logon: (user.last_logon as string | null | undefined) || undefined,
      profile_picture_url: (user.profile_picture_url as string | null | undefined) || undefined,
      profile_source: profile_source_ui,
    };
  } catch (error) {
    return { authenticated: false };
  }
}

/**
 * Checks if user is authenticated in server components/pages (simple boolean check)
 * @returns true if authenticated, false otherwise
 */
export async function is_server_authenticated(): Promise<boolean> {
  const result = await get_server_auth_user();
  return result.authenticated;
}

