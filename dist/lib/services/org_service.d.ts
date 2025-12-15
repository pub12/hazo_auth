import type { HazoConnectAdapter } from "hazo_connect";
/**
 * Organization record from hazo_org table
 */
export type OrgRecord = {
    id: string;
    name: string;
    user_limit: number;
    parent_org_id: string | null;
    root_org_id: string | null;
    active: boolean;
    created_at: string;
    created_by: string | null;
    changed_at: string;
    changed_by: string | null;
};
/**
 * Organization record with computed user count
 */
export type OrgWithUserCount = OrgRecord & {
    current_user_count: number;
};
/**
 * Result type for org service operations
 */
export type OrgServiceResult = {
    success: boolean;
    org?: OrgRecord;
    orgs?: OrgRecord[];
    error?: string;
};
/**
 * Result type for org service operations with user count
 */
export type OrgServiceResultWithCount = {
    success: boolean;
    org?: OrgWithUserCount;
    orgs?: OrgWithUserCount[];
    error?: string;
};
/**
 * Data for creating a new organization
 */
export type CreateOrgData = {
    name: string;
    user_limit?: number;
    parent_org_id?: string;
    created_by: string;
};
/**
 * Data for updating an organization
 */
export type UpdateOrgData = {
    name?: string;
    user_limit?: number;
    changed_by: string;
};
/**
 * Organization tree node for hierarchy display
 */
export type OrgTreeNode = OrgWithUserCount & {
    children?: OrgTreeNode[];
};
/**
 * Options for getting organizations
 */
export type GetOrgsOptions = {
    root_org_id?: string;
    include_inactive?: boolean;
};
/**
 * Gets the user count for an organization
 * @param adapter - HazoConnect adapter
 * @param org_id - Organization ID
 * @returns User count
 */
export declare function get_org_user_count(adapter: HazoConnectAdapter, org_id: string): Promise<{
    success: boolean;
    count?: number;
    error?: string;
}>;
/**
 * Gets user count for the root organization (includes all child orgs)
 * @param adapter - HazoConnect adapter
 * @param root_org_id - Root organization ID
 * @returns Total user count across org tree
 */
export declare function get_root_org_user_count(adapter: HazoConnectAdapter, root_org_id: string): Promise<{
    success: boolean;
    count?: number;
    error?: string;
}>;
/**
 * Gets all organizations, optionally filtered by root_org_id
 * @param adapter - HazoConnect adapter
 * @param options - Filter options
 * @returns List of organizations
 */
export declare function get_orgs(adapter: HazoConnectAdapter, options?: GetOrgsOptions): Promise<OrgServiceResult>;
/**
 * Gets a single organization by ID with computed user count
 * @param adapter - HazoConnect adapter
 * @param org_id - Organization ID
 * @returns Organization with user count
 */
export declare function get_org_by_id(adapter: HazoConnectAdapter, org_id: string): Promise<OrgServiceResultWithCount>;
/**
 * Creates a new organization
 * @param adapter - HazoConnect adapter
 * @param data - Organization data
 * @returns Created organization
 */
export declare function create_org(adapter: HazoConnectAdapter, data: CreateOrgData): Promise<OrgServiceResult>;
/**
 * Updates an existing organization
 * @param adapter - HazoConnect adapter
 * @param org_id - Organization ID
 * @param data - Update data
 * @returns Updated organization
 */
export declare function update_org(adapter: HazoConnectAdapter, org_id: string, data: UpdateOrgData): Promise<OrgServiceResult>;
/**
 * Soft deletes an organization (sets active = false)
 * @param adapter - HazoConnect adapter
 * @param org_id - Organization ID
 * @param changed_by - User ID making the change
 * @returns Deactivated organization
 */
export declare function soft_delete_org(adapter: HazoConnectAdapter, org_id: string, changed_by: string): Promise<OrgServiceResult>;
/**
 * Gets immediate children of an organization
 * @param adapter - HazoConnect adapter
 * @param org_id - Parent organization ID
 * @returns Child organizations
 */
export declare function get_org_children(adapter: HazoConnectAdapter, org_id: string, include_inactive?: boolean): Promise<OrgServiceResult>;
/**
 * Gets all ancestors of an organization up to root
 * Returns array ordered from immediate parent to root
 * @param adapter - HazoConnect adapter
 * @param org_id - Organization ID
 * @returns Ancestor organizations
 */
export declare function get_org_ancestors(adapter: HazoConnectAdapter, org_id: string): Promise<OrgServiceResult>;
/**
 * Gets all descendants of an organization
 * Returns flat array of all descendant orgs
 * @param adapter - HazoConnect adapter
 * @param org_id - Organization ID
 * @returns Descendant organizations
 */
export declare function get_org_descendants(adapter: HazoConnectAdapter, org_id: string, include_inactive?: boolean): Promise<OrgServiceResult>;
/**
 * Gets organization hierarchy tree
 * @param adapter - HazoConnect adapter
 * @param root_org_id - Optional root org ID to start from (global admin: no filter)
 * @param include_inactive - Include inactive orgs in tree
 * @returns Nested organization tree
 */
export declare function get_org_tree(adapter: HazoConnectAdapter, root_org_id?: string, include_inactive?: boolean): Promise<{
    success: boolean;
    tree?: OrgTreeNode[];
    error?: string;
}>;
/**
 * Checks if a user can be added to an organization (user_limit check)
 * Only applies to root-level orgs (checks root_org's user_limit)
 * @param adapter - HazoConnect adapter
 * @param org_id - Organization ID
 * @returns Whether user can be added and reason if not
 */
export declare function can_add_user_to_org(adapter: HazoConnectAdapter, org_id: string): Promise<{
    success: boolean;
    can_add: boolean;
    reason?: string;
    error?: string;
}>;
/**
 * Checks if user has access to an organization (is in org's hierarchy)
 * @param adapter - HazoConnect adapter
 * @param user_org_id - User's org_id
 * @param user_root_org_id - User's root_org_id
 * @param target_org_id - Target org to check access to
 * @returns Whether user has access
 */
export declare function check_user_org_access(adapter: HazoConnectAdapter, user_org_id: string | null, user_root_org_id: string | null, target_org_id: string): Promise<{
    success: boolean;
    has_access: boolean;
    error?: string;
}>;
//# sourceMappingURL=org_service.d.ts.map