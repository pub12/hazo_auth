import type { HazoConnectAdapter } from "hazo_connect";
/**
 * Super admin scope ID - special UUID for system-level administrators
 * Users assigned to this scope have global access
 */
export declare const SUPER_ADMIN_SCOPE_ID = "00000000-0000-0000-0000-000000000000";
/**
 * Default system scope ID - for non-multi-tenancy mode
 * All users are assigned to this scope when multi-tenancy is disabled
 */
export declare const DEFAULT_SYSTEM_SCOPE_ID = "00000000-0000-0000-0000-000000000001";
/**
 * Firm branding configuration stored as separate columns on hazo_scopes
 * Only root scopes (firms) typically have branding set - child scopes inherit
 */
export type FirmBranding = {
    logo_url?: string | null;
    primary_color?: string | null;
    secondary_color?: string | null;
    tagline?: string | null;
};
export type ScopeRecord = {
    id: string;
    name: string;
    level: string;
    parent_id: string | null;
    logo_url: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    tagline: string | null;
    created_at: string;
    changed_at: string;
};
export type ScopeServiceResult = {
    success: boolean;
    scope?: ScopeRecord;
    scopes?: ScopeRecord[];
    error?: string;
};
export type CreateScopeData = {
    name: string;
    level: string;
    parent_id?: string | null;
    logo_url?: string | null;
    primary_color?: string | null;
    secondary_color?: string | null;
    tagline?: string | null;
};
export type UpdateScopeData = {
    name?: string;
    level?: string;
    parent_id?: string | null;
    logo_url?: string | null;
    primary_color?: string | null;
    secondary_color?: string | null;
    tagline?: string | null;
};
export type ScopeTreeNode = ScopeRecord & {
    children?: ScopeTreeNode[];
};
/**
 * Extracts branding fields from a ScopeRecord into a FirmBranding object
 * Returns null if all branding fields are empty
 */
export declare function extract_branding(scope: ScopeRecord): FirmBranding | null;
/**
 * Checks if a scope has any branding set
 */
export declare function has_branding(scope: ScopeRecord): boolean;
/**
 * Checks if the given scope_id is the super admin scope
 */
export declare function is_super_admin_scope(scope_id: string): boolean;
/**
 * Checks if the given scope_id is the default system scope
 */
export declare function is_default_system_scope(scope_id: string): boolean;
/**
 * Checks if the given scope_id is a system scope (super admin or default system)
 */
export declare function is_system_scope(scope_id: string): boolean;
/**
 * Gets all scopes, optionally filtered by parent_id
 */
export declare function get_all_scopes(adapter: HazoConnectAdapter, parent_id?: string | null): Promise<ScopeServiceResult>;
/**
 * Gets root scopes (scopes with no parent)
 */
export declare function get_root_scopes(adapter: HazoConnectAdapter): Promise<ScopeServiceResult>;
/**
 * Gets a single scope by ID
 */
export declare function get_scope_by_id(adapter: HazoConnectAdapter, scope_id: string): Promise<ScopeServiceResult>;
/**
 * Gets a single scope by name (case-insensitive partial match not supported - exact match)
 */
export declare function get_scope_by_name(adapter: HazoConnectAdapter, name: string): Promise<ScopeServiceResult>;
/**
 * Creates a new scope
 */
export declare function create_scope(adapter: HazoConnectAdapter, data: CreateScopeData): Promise<ScopeServiceResult>;
/**
 * Updates an existing scope
 */
export declare function update_scope(adapter: HazoConnectAdapter, scope_id: string, data: UpdateScopeData): Promise<ScopeServiceResult>;
/**
 * Deletes a scope (cascades to children via database FK constraints)
 */
export declare function delete_scope(adapter: HazoConnectAdapter, scope_id: string): Promise<ScopeServiceResult>;
/**
 * Gets immediate children of a scope
 */
export declare function get_scope_children(adapter: HazoConnectAdapter, scope_id: string): Promise<ScopeServiceResult>;
/**
 * Gets all ancestors of a scope up to root
 * Returns array ordered from immediate parent to root
 */
export declare function get_scope_ancestors(adapter: HazoConnectAdapter, scope_id: string): Promise<ScopeServiceResult>;
/**
 * Gets all descendants of a scope (all levels below)
 * Returns flat array of all descendant scopes
 */
export declare function get_scope_descendants(adapter: HazoConnectAdapter, scope_id: string): Promise<ScopeServiceResult>;
/**
 * Gets the root scope ID for a given scope (follows parent_id to root)
 */
export declare function get_root_scope_id(adapter: HazoConnectAdapter, scope_id: string): Promise<string | null>;
/**
 * Gets scope hierarchy tree starting from root scopes or a specific scope
 */
export declare function get_scope_tree(adapter: HazoConnectAdapter, root_scope_id?: string): Promise<{
    success: boolean;
    tree?: ScopeTreeNode[];
    error?: string;
}>;
/**
 * Ensures the super admin scope exists
 */
export declare function ensure_super_admin_scope(adapter: HazoConnectAdapter): Promise<ScopeServiceResult>;
/**
 * Ensures the default system scope exists
 */
export declare function ensure_default_system_scope(adapter: HazoConnectAdapter): Promise<ScopeServiceResult>;
//# sourceMappingURL=scope_service.d.ts.map