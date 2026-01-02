import type { HazoConnectAdapter } from "hazo_connect";
import { type ScopeRecord } from "./scope_service.js";
import { type UserScope } from "./user_scope_service.js";
export type CreateFirmData = {
    firm_name: string;
    org_structure: string;
    user_id: string;
    role_id?: string;
};
export type CreateFirmResult = {
    success: boolean;
    scope?: ScopeRecord;
    user_scope?: UserScope;
    error?: string;
};
/**
 * Gets or creates the default "owner" role for firm creators
 * Uses a well-known UUID to ensure consistency across databases
 */
export declare function ensure_owner_role(adapter: HazoConnectAdapter): Promise<{
    success: boolean;
    role_id?: string;
    error?: string;
}>;
/**
 * Creates a new firm (root scope) for a user
 * This is called when a user verifies their email and has no existing scope or invitation
 */
export declare function create_firm(adapter: HazoConnectAdapter, data: CreateFirmData): Promise<CreateFirmResult>;
/**
 * Gets a role by name
 */
export declare function get_role_by_name(adapter: HazoConnectAdapter, role_name: string): Promise<{
    success: boolean;
    role_id?: string;
    error?: string;
}>;
//# sourceMappingURL=firm_service.d.ts.map