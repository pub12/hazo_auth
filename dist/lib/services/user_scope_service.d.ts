import type { HazoConnectAdapter } from "hazo_connect";
import { type ScopeLevel } from "./scope_service";
export type UserScope = {
    user_id: string;
    scope_id: string;
    scope_seq: string;
    scope_type: ScopeLevel;
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
        scope_type: ScopeLevel;
        scope_id: string;
        scope_seq: string;
    };
    user_scopes?: UserScope[];
};
/**
 * Gets all scope assignments for a user
 */
export declare function get_user_scopes(adapter: HazoConnectAdapter, user_id: string): Promise<UserScopeResult>;
/**
 * Gets all users assigned to a specific scope
 */
export declare function get_users_by_scope(adapter: HazoConnectAdapter, scope_type: ScopeLevel, scope_id: string): Promise<UserScopeResult>;
/**
 * Assigns a scope to a user
 */
export declare function assign_user_scope(adapter: HazoConnectAdapter, user_id: string, scope_type: ScopeLevel, scope_id: string, scope_seq: string): Promise<UserScopeResult>;
/**
 * Removes a scope assignment from a user
 */
export declare function remove_user_scope(adapter: HazoConnectAdapter, user_id: string, scope_type: ScopeLevel, scope_id: string): Promise<UserScopeResult>;
/**
 * Bulk update user scope assignments
 * Replaces all existing assignments with the new set
 */
export declare function update_user_scopes(adapter: HazoConnectAdapter, user_id: string, new_scopes: Array<{
    scope_type: ScopeLevel;
    scope_id: string;
    scope_seq: string;
}>): Promise<UserScopeResult>;
/**
 * Checks if a user has access to a specific scope
 * Access is granted if:
 * 1. User has the exact scope assigned, OR
 * 2. User has access to an ancestor scope (L2 user can access L3, L4, etc.)
 *
 * @param adapter - HazoConnect adapter
 * @param user_id - User ID to check
 * @param target_scope_type - The scope level being accessed
 * @param target_scope_id - The scope ID being accessed (optional if target_scope_seq provided)
 * @param target_scope_seq - The scope seq being accessed (optional if target_scope_id provided)
 */
export declare function check_user_scope_access(adapter: HazoConnectAdapter, user_id: string, target_scope_type: ScopeLevel, target_scope_id?: string, target_scope_seq?: string): Promise<ScopeAccessCheckResult>;
/**
 * Gets the effective scopes a user has access to
 * This includes directly assigned scopes and all their descendants
 */
export declare function get_user_effective_scopes(adapter: HazoConnectAdapter, user_id: string): Promise<{
    success: boolean;
    direct_scopes?: UserScope[];
    inherited_scope_types?: ScopeLevel[];
    error?: string;
}>;
//# sourceMappingURL=user_scope_service.d.ts.map