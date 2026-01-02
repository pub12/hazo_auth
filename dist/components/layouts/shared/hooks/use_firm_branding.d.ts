/**
 * Firm branding data structure
 */
export type FirmBranding = {
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    tagline?: string;
};
/**
 * Options for use_firm_branding hook
 */
export type UseFirmBrandingOptions = {
    /**
     * Scope ID to get branding for
     * If not provided, uses current user's root scope
     */
    scope_id?: string;
    /**
     * Whether to resolve inheritance (default: true)
     * If true, child scopes will get their root scope's branding
     */
    resolve_inheritance?: boolean;
    /**
     * Skip fetch (for conditional use)
     */
    skip?: boolean;
};
/**
 * Result type for use_firm_branding hook
 */
export type UseFirmBrandingResult = {
    /**
     * The branding data (null if no branding set)
     */
    branding: FirmBranding | null;
    /**
     * Loading state
     */
    loading: boolean;
    /**
     * Error state
     */
    error: Error | null;
    /**
     * Whether the branding was inherited from a parent scope
     */
    is_inherited: boolean;
    /**
     * Manual refetch function
     */
    refetch: () => Promise<void>;
};
/**
 * React hook for fetching firm branding
 * @param options - Optional parameters for scope and inheritance
 * @returns UseFirmBrandingResult with branding data, loading state, and refetch function
 */
export declare function use_firm_branding(options?: UseFirmBrandingOptions): UseFirmBrandingResult;
/**
 * React hook for fetching the current user's firm branding
 * This hook first fetches the user's scope, then gets the branding for that scope
 * @returns UseFirmBrandingResult with branding data, loading state, and refetch function
 */
export declare function use_current_user_branding(): UseFirmBrandingResult;
//# sourceMappingURL=use_firm_branding.d.ts.map