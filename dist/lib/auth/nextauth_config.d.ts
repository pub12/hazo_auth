import type { AuthOptions } from "next-auth";
export type NextAuthCallbackUser = {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
};
export type NextAuthCallbackAccount = {
    provider: string;
    providerAccountId: string;
    type: string;
    access_token?: string;
    id_token?: string;
    expires_at?: number;
};
export type NextAuthCallbackProfile = {
    sub?: string;
    name?: string;
    email?: string;
    picture?: string;
    email_verified?: boolean;
};
/**
 * Gets NextAuth.js configuration with enabled OAuth providers
 * Providers are dynamically configured based on hazo_auth_config.ini settings
 * @returns NextAuth configuration object
 */
export declare function get_nextauth_config(): AuthOptions;
/**
 * Checks if any OAuth providers are configured and enabled
 * @returns true if at least one OAuth provider is available
 */
export declare function has_oauth_providers(): boolean;
//# sourceMappingURL=nextauth_config.d.ts.map