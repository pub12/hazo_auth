export type AuthStatusData = {
    authenticated: boolean;
    user_id?: string;
    email?: string;
    name?: string;
    email_verified?: boolean;
    last_logon?: string;
    profile_picture_url?: string;
    profile_image?: string;
    avatar_url?: string;
    image?: string;
    profile_source?: "upload" | "library" | "gravatar" | "custom";
    permissions?: string[];
    permission_ok?: boolean;
    missing_permissions?: string[];
    auth_providers?: string;
    has_password?: boolean;
    google_connected?: boolean;
    loading: boolean;
};
export type AuthStatus = AuthStatusData & {
    refresh: () => Promise<void>;
};
/**
 * Dispatches a custom event to notify all auth status hooks to refresh
 */
export declare function trigger_auth_status_refresh(): void;
export declare function use_auth_status(): AuthStatus;
//# sourceMappingURL=use_auth_status.d.ts.map