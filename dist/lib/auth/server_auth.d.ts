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
export type ServerAuthResult = ServerAuthUser | {
    authenticated: false;
};
/**
 * Gets authenticated user in server components/pages
 * Uses Next.js cookies() function to read authentication cookies
 * @returns ServerAuthResult with user info or authenticated: false
 */
export declare function get_server_auth_user(): Promise<ServerAuthResult>;
/**
 * Checks if user is authenticated in server components/pages (simple boolean check)
 * @returns true if authenticated, false otherwise
 */
export declare function is_server_authenticated(): Promise<boolean>;
//# sourceMappingURL=server_auth.d.ts.map