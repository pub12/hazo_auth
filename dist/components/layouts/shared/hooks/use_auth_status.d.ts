export type AuthStatusData = {
    authenticated: boolean;
    user_id?: string;
    email?: string;
    name?: string;
    email_verified?: boolean;
    last_logon?: string;
    profile_picture_url?: string;
    profile_source?: "upload" | "library" | "gravatar" | "custom";
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