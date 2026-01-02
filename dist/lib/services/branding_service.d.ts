import type { HazoConnectAdapter } from "hazo_connect";
import { type FirmBranding, type ScopeRecord } from "./scope_service.js";
export type BrandingServiceResult = {
    success: boolean;
    branding?: FirmBranding | null;
    scope?: ScopeRecord;
    error?: string;
};
export type UpdateBrandingData = {
    logo_url?: string | null;
    primary_color?: string | null;
    secondary_color?: string | null;
    tagline?: string | null;
};
/**
 * Validates branding data
 */
export declare function validate_branding(data: UpdateBrandingData): {
    valid: boolean;
    error?: string;
};
/**
 * Gets branding for a specific scope (does not resolve inheritance)
 * Use get_effective_branding for inherited branding
 */
export declare function get_scope_branding(adapter: HazoConnectAdapter, scope_id: string): Promise<BrandingServiceResult>;
/**
 * Gets effective branding for a scope, resolving inheritance from root scope
 * If the scope is a child, it will traverse up to the root scope to get branding
 */
export declare function get_effective_branding(adapter: HazoConnectAdapter, scope_id: string): Promise<BrandingServiceResult>;
/**
 * Updates branding for a scope (merges with existing branding)
 * Only root scopes (parent_id = null) should typically have branding set
 */
export declare function update_branding(adapter: HazoConnectAdapter, scope_id: string, data: UpdateBrandingData): Promise<BrandingServiceResult>;
/**
 * Replaces branding entirely for a scope
 */
export declare function replace_branding(adapter: HazoConnectAdapter, scope_id: string, branding: FirmBranding | null): Promise<BrandingServiceResult>;
/**
 * Clears branding for a scope
 */
export declare function clear_branding(adapter: HazoConnectAdapter, scope_id: string): Promise<BrandingServiceResult>;
/**
 * Gets branding for a user based on their root scope
 * This is typically used to get the firm branding for a user
 */
export declare function get_user_firm_branding(adapter: HazoConnectAdapter, user_scope_id: string): Promise<BrandingServiceResult>;
//# sourceMappingURL=branding_service.d.ts.map