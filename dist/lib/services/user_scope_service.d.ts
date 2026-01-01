import type { HazoConnectAdapter } from "hazo_connect";
export type UserScope = {
    user_id: string;
    scope_id: string;
    root_scope_id: string;
    role_id: string;
    created_at: string;
    changed_at: string;
};
export type UserScopeResult = {
    success: boolean;
    scope?: UserScope;
    scopes?: UserScope[];
    error?: string;
};
export type ScopeAccessCheckResult = {
    has_access: boolean;
    access_via?: {
        scope_id: string;
        scope_name?: string;
    };
    user_scopes?: UserScope[];
    is_super_admin?: boolean;
};
export type AssignUserScopeData = {
    user_id: string;
    scope_id: string;
    role_id: string;
    root_scope_id?: string;
};
/**
 * Gets all scope assignments for a user
 */
export declare function get_user_scopes(adapter: HazoConnectAdapter, user_id: string): Promise<UserScopeResult>;
/**
 * Gets all users assigned to a specific scope
 */
export declare function get_users_by_scope(adapter: HazoConnectAdapter, scope_id: string): Promise<UserScopeResult>;
/**
 * Assigns a scope to a user
 */
export declare function assign_user_scope(adapter: HazoConnectAdapter, data: AssignUserScopeData): Promise<UserScopeResult>;
/**
 * Removes a scope assignment from a user
 */
export declare function remove_user_scope(adapter: HazoConnectAdapter, user_id: string, scope_id: string): Promise<UserScopeResult>;
/**
 * Bulk update user scope assignments
 * Replaces all existing assignments with the new set
 */
export declare function update_user_scopes(adapter: HazoConnectAdapter, user_id: string, new_scopes: Array<{
    scope_id: string;
    role_id: string;
}>): Promise<UserScopeResult>;
/**
 * Checks if a user is a super admin (has super admin scope assigned)
 */
export declare function is_user_super_admin(adapter: HazoConnectAdapter, user_id: string): Promise<boolean>;
/**
 * Checks if a user has any scope assigned
 */
export declare function user_has_any_scope(adapter: HazoConnectAdapter, user_id: string): Promise<boolean>;
/**
 * Checks if a user has access to a specific scope
 * Access is granted if:
 * 1. User is a super admin (has super admin scope)
 * 2. User has the exact scope assigned
 * 3. User has access to an ancestor scope (inherited access)
 *
 * @param adapter - HazoConnect adapter
 * @param user_id - User ID to check
 * @param target_scope_id - The scope ID being accessed
 */
export declare function check_user_scope_access(adapter: HazoConnectAdapter, user_id: string, target_scope_id: string): Promise<ScopeAccessCheckResult>;
/**
 * Gets scopes a user has direct access to (not inherited)
 */
export declare function get_user_direct_scopes(adapter: HazoConnectAdapter, user_id: string): Promise<{
    success: boolean;
    scopes?: Array<{
        scope_id: string;
        scope_name?: string;
        level?: string;
        role_id: string;
    }>;
    error?: string;
}>;
/**
 * Assigns super admin scope to a user
 */
export declare function assign_super_admin_scope(adapter: HazoConnectAdapter, user_id: string, role_id: string): Promise<UserScopeResult>;
//# sourceMappingURL=user_scope_service.d.ts.map