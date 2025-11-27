import type { HazoAuthResult } from "../../../../lib/auth/auth_types";
/**
 * Options for use_hazo_auth hook
 */
export type UseHazoAuthOptions = {
    /**
     * Array of required permissions to check
     */
    required_permissions?: string[];
    /**
     * If true, throws error when permissions are missing (default: false)
     */
    strict?: boolean;
    /**
     * Skip fetch (for conditional use)
     */
    skip?: boolean;
};
/**
 * Result type for use_hazo_auth hook
 */
export type UseHazoAuthResult = HazoAuthResult & {
    /**
     * Loading state
     */
    loading: boolean;
    /**
     * Error state
     */
    error: Error | null;
    /**
     * Manual refetch function
     */
    refetch: () => Promise<void>;
};
/**
 * Triggers a refresh of hazo_auth status across all components
 * Dispatches a custom event that all use_hazo_auth hooks listen to
 */
export declare function trigger_hazo_auth_refresh(): void;
/**
 * React hook for hazo_get_auth utility
 * Fetches authentication status and permissions from /api/auth/get_auth
 * @param options - Optional parameters for permission checking
 * @returns UseHazoAuthResult with auth data, loading state, and refetch function
 */
export declare function use_hazo_auth(options?: UseHazoAuthOptions): UseHazoAuthResult;
//# sourceMappingURL=use_hazo_auth.d.ts.map