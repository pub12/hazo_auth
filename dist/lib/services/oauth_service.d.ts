import type { HazoConnectAdapter } from "hazo_connect";
export type GoogleOAuthData = {
    /** Google's unique user ID (sub claim from JWT) */
    google_id: string;
    /** User's email address from Google */
    email: string;
    /** User's full name from Google profile */
    name?: string;
    /** User's profile picture URL from Google */
    profile_picture_url?: string;
    /** Whether Google has verified this email */
    email_verified: boolean;
};
export type OAuthLoginResult = {
    success: boolean;
    user_id?: string;
    /** True if this was a newly created account */
    is_new_user?: boolean;
    /** True if Google was linked to an existing account */
    was_linked?: boolean;
    /** The user's email address */
    email?: string;
    /** The user's name */
    name?: string;
    error?: string;
};
export type LinkGoogleResult = {
    success: boolean;
    error?: string;
};
export type AuthProvidersResult = {
    success: boolean;
    auth_providers?: string[];
    has_password?: boolean;
    error?: string;
};
/**
 * Handles Google OAuth login/registration flow
 * 1. Check if user exists with google_id -> login
 * 2. Check if user exists with email -> link Google account
 * 3. Create new user with Google data
 *
 * @param adapter - The hazo_connect adapter instance
 * @param data - Google OAuth user data
 * @returns OAuth login result with user_id and status flags
 */
export declare function handle_google_oauth_login(adapter: HazoConnectAdapter, data: GoogleOAuthData): Promise<OAuthLoginResult>;
/**
 * Links a Google account to an existing user
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - The user's ID
 * @param google_id - Google's unique user ID
 * @returns Result indicating success or failure
 */
export declare function link_google_account(adapter: HazoConnectAdapter, user_id: string, google_id: string): Promise<LinkGoogleResult>;
/**
 * Checks if a user has a password set (non-empty password_hash)
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - The user's ID
 * @returns True if user has a password set
 */
export declare function user_has_password(adapter: HazoConnectAdapter, user_id: string): Promise<boolean>;
/**
 * Checks if a user has a password set by email
 * @param adapter - The hazo_connect adapter instance
 * @param email - The user's email address
 * @returns True if user has a password set
 */
export declare function user_has_password_by_email(adapter: HazoConnectAdapter, email: string): Promise<boolean>;
/**
 * Gets a user's authentication providers and password status
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - The user's ID
 * @returns Auth providers array and has_password flag
 */
export declare function get_user_auth_providers(adapter: HazoConnectAdapter, user_id: string): Promise<AuthProvidersResult>;
/**
 * Sets a password for a user who doesn't have one (e.g., Google-only users)
 * @param adapter - The hazo_connect adapter instance
 * @param user_id - The user's ID
 * @param password_hash - The hashed password to set
 * @returns Result indicating success or failure
 */
export declare function set_user_password(adapter: HazoConnectAdapter, user_id: string, password_hash: string): Promise<{
    success: boolean;
    error?: string;
}>;
//# sourceMappingURL=oauth_service.d.ts.map