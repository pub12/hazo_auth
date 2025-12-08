// file_description: service for managing HRBAC scope labels using hazo_connect
// section: imports
import type { HazoConnectAdapter } from "hazo_connect";
import { createCrudService } from "hazo_connect/server";
import { randomUUID } from "crypto";
import { create_app_logger } from "../app_logger";
import { sanitize_error_for_user } from "../utils/error_sanitizer";
import type { ScopeLevel } from "./scope_service";
import { SCOPE_LEVELS } from "./scope_service";

// section: types
export type ScopeLabel = {
  id: string;
  org: string;
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

// section: constants
export const DEFAULT_SCOPE_LABELS: Record<ScopeLevel, string> = {
  hazo_scopes_l1: "Level 1",
  hazo_scopes_l2: "Level 2",
  hazo_scopes_l3: "Level 3",
  hazo_scopes_l4: "Level 4",
  hazo_scopes_l5: "Level 5",
  hazo_scopes_l6: "Level 6",
  hazo_scopes_l7: "Level 7",
};

// section: helpers

/**
 * Gets all scope labels for an organization
 */
export async function get_scope_labels(
  adapter: HazoConnectAdapter,
  org: string,
): Promise<ScopeLabelResult> {
  try {
    const label_service = createCrudService(adapter, "hazo_scope_labels");
    const labels = await label_service.findBy({ org });

    return {
      success: true,
      labels: Array.isArray(labels) ? (labels as ScopeLabel[]) : [],
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "scope_labels_service.ts",
        line_number: 0,
        operation: "get_scope_labels",
        org,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Gets all scope labels for an organization, with defaults filled in for missing levels
 */
export async function get_scope_labels_with_defaults(
  adapter: HazoConnectAdapter,
  org: string,
  custom_defaults?: Record<ScopeLevel, string>,
): Promise<ScopeLabelResult> {
  try {
    const result = await get_scope_labels(adapter, org);
    if (!result.success) {
      return result;
    }

    const existing_labels = result.labels || [];
    const labels_map = new Map<ScopeLevel, ScopeLabel>();

    // Add existing labels to map
    for (const label of existing_labels) {
      labels_map.set(label.scope_type, label);
    }

    // Create synthetic entries for missing levels (with default labels)
    const defaults = custom_defaults || DEFAULT_SCOPE_LABELS;
    const all_labels: ScopeLabel[] = [];

    for (const level of SCOPE_LEVELS) {
      if (labels_map.has(level)) {
        all_labels.push(labels_map.get(level)!);
      } else {
        // Create a synthetic label entry (not persisted)
        all_labels.push({
          id: "", // Empty ID indicates this is a default, not from DB
          org,
          scope_type: level,
          label: defaults[level],
          created_at: "",
          changed_at: "",
        });
      }
    }

    return {
      success: true,
      labels: all_labels,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "scope_labels_service.ts",
        line_number: 0,
        operation: "get_scope_labels_with_defaults",
        org,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Gets the label for a specific scope level
 * Returns the custom label if set, otherwise returns the default
 */
export async function get_label_for_level(
  adapter: HazoConnectAdapter,
  org: string,
  scope_type: ScopeLevel,
  custom_default?: string,
): Promise<string> {
  try {
    const label_service = createCrudService(adapter, "hazo_scope_labels");
    const labels = await label_service.findBy({ org, scope_type });

    if (Array.isArray(labels) && labels.length > 0) {
      return (labels[0] as ScopeLabel).label;
    }

    return custom_default || DEFAULT_SCOPE_LABELS[scope_type];
  } catch {
    // Return default on any error
    return custom_default || DEFAULT_SCOPE_LABELS[scope_type];
  }
}

/**
 * Creates or updates a scope label for an organization
 * Uses upsert pattern - creates if not exists, updates if exists
 */
export async function upsert_scope_label(
  adapter: HazoConnectAdapter,
  org: string,
  scope_type: ScopeLevel,
  label: string,
): Promise<ScopeLabelResult> {
  try {
    const label_service = createCrudService(adapter, "hazo_scope_labels");
    const now = new Date().toISOString();

    // Check if label already exists for this org + scope_type
    const existing = await label_service.findBy({ org, scope_type });

    if (Array.isArray(existing) && existing.length > 0) {
      // Update existing
      const existing_label = existing[0] as ScopeLabel;
      const updated = await label_service.updateById(existing_label.id, {
        label,
        changed_at: now,
      });

      if (!Array.isArray(updated) || updated.length === 0) {
        return {
          success: false,
          error: "Failed to update scope label",
        };
      }

      return {
        success: true,
        label: updated[0] as ScopeLabel,
      };
    } else {
      // Create new
      const inserted = await label_service.insert({
        id: randomUUID(),
        org,
        scope_type,
        label,
        created_at: now,
        changed_at: now,
      });

      if (!Array.isArray(inserted) || inserted.length === 0) {
        return {
          success: false,
          error: "Failed to create scope label",
        };
      }

      return {
        success: true,
        label: inserted[0] as ScopeLabel,
      };
    }
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "scope_labels_service.ts",
        line_number: 0,
        operation: "upsert_scope_label",
        org,
        scope_type,
        label,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Batch upsert scope labels for an organization
 * Useful for saving all labels at once from the UI
 */
export async function batch_upsert_scope_labels(
  adapter: HazoConnectAdapter,
  org: string,
  labels: Array<{ scope_type: ScopeLevel; label: string }>,
): Promise<ScopeLabelResult> {
  try {
    const results: ScopeLabel[] = [];

    for (const { scope_type, label } of labels) {
      const result = await upsert_scope_label(adapter, org, scope_type, label);
      if (!result.success) {
        return {
          success: false,
          error: `Failed to save label for ${scope_type}: ${result.error}`,
        };
      }
      if (result.label) {
        results.push(result.label);
      }
    }

    return {
      success: true,
      labels: results,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "scope_labels_service.ts",
        line_number: 0,
        operation: "batch_upsert_scope_labels",
        org,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Deletes a scope label, reverting to default
 */
export async function delete_scope_label(
  adapter: HazoConnectAdapter,
  org: string,
  scope_type: ScopeLevel,
): Promise<ScopeLabelResult> {
  try {
    const label_service = createCrudService(adapter, "hazo_scope_labels");

    // Find the label
    const existing = await label_service.findBy({ org, scope_type });

    if (!Array.isArray(existing) || existing.length === 0) {
      return {
        success: true, // Already doesn't exist
      };
    }

    const existing_label = existing[0] as ScopeLabel;
    await label_service.deleteById(existing_label.id);

    return {
      success: true,
      label: existing_label,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "scope_labels_service.ts",
        line_number: 0,
        operation: "delete_scope_label",
        org,
        scope_type,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}
