import type { HazoConnectAdapter } from "hazo_connect";
import type { ScopeLevel } from "./scope_service";
export type ScopeLabel = {
    id: string;
    org_id: string;
    scope_type: ScopeLevel;
    label: string;
    created_at: string;
    changed_at: string;
};
export type ScopeLabelResult = {
    success: boolean;
    label?: ScopeLabel;
    labels?: ScopeLabel[];
    error?: string;
};
export declare const DEFAULT_SCOPE_LABELS: Record<ScopeLevel, string>;
/**
 * Gets all scope labels for an organization
 */
export declare function get_scope_labels(adapter: HazoConnectAdapter, org_id: string): Promise<ScopeLabelResult>;
/**
 * Gets all scope labels for an organization, with defaults filled in for missing levels
 */
export declare function get_scope_labels_with_defaults(adapter: HazoConnectAdapter, org_id: string, custom_defaults?: Record<ScopeLevel, string>): Promise<ScopeLabelResult>;
/**
 * Gets the label for a specific scope level
 * Returns the custom label if set, otherwise returns the default
 */
export declare function get_label_for_level(adapter: HazoConnectAdapter, org_id: string, scope_type: ScopeLevel, custom_default?: string): Promise<string>;
/**
 * Creates or updates a scope label for an organization
 * Uses upsert pattern - creates if not exists, updates if exists
 */
export declare function upsert_scope_label(adapter: HazoConnectAdapter, org_id: string, scope_type: ScopeLevel, label: string): Promise<ScopeLabelResult>;
/**
 * Batch upsert scope labels for an organization
 * Useful for saving all labels at once from the UI
 */
export declare function batch_upsert_scope_labels(adapter: HazoConnectAdapter, org_id: string, labels: Array<{
    scope_type: ScopeLevel;
    label: string;
}>): Promise<ScopeLabelResult>;
/**
 * Deletes a scope label, reverting to default
 */
export declare function delete_scope_label(adapter: HazoConnectAdapter, org_id: string, scope_type: ScopeLevel): Promise<ScopeLabelResult>;
//# sourceMappingURL=scope_labels_service.d.ts.map