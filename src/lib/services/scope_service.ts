// file_description: service for HRBAC scope operations using hazo_connect
// section: imports
import type { HazoConnectAdapter } from "hazo_connect";
import { createCrudService } from "hazo_connect/server";
import { create_app_logger } from "../app_logger";
import { sanitize_error_for_user } from "../utils/error_sanitizer";

// section: types
export type ScopeLevel =
  | "hazo_scopes_l1"
  | "hazo_scopes_l2"
  | "hazo_scopes_l3"
  | "hazo_scopes_l4"
  | "hazo_scopes_l5"
  | "hazo_scopes_l6"
  | "hazo_scopes_l7";

export type ScopeRecord = {
  id: string;
  seq: string;
  org: string;
  name: string;
  parent_scope_id?: string | null;
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
  org: string;
  name: string;
  parent_scope_id?: string;
};

export type UpdateScopeData = {
  name?: string;
  parent_scope_id?: string | null;
};

// section: constants
export const SCOPE_LEVELS: ScopeLevel[] = [
  "hazo_scopes_l1",
  "hazo_scopes_l2",
  "hazo_scopes_l3",
  "hazo_scopes_l4",
  "hazo_scopes_l5",
  "hazo_scopes_l6",
  "hazo_scopes_l7",
];

export const SCOPE_LEVEL_NUMBERS: Record<ScopeLevel, number> = {
  hazo_scopes_l1: 1,
  hazo_scopes_l2: 2,
  hazo_scopes_l3: 3,
  hazo_scopes_l4: 4,
  hazo_scopes_l5: 5,
  hazo_scopes_l6: 6,
  hazo_scopes_l7: 7,
};

// section: helpers

/**
 * Validates that the provided string is a valid scope level
 */
export function is_valid_scope_level(level: string): level is ScopeLevel {
  return SCOPE_LEVELS.includes(level as ScopeLevel);
}

/**
 * Gets the parent level for a given scope level
 * Returns undefined for L1 (root level)
 */
export function get_parent_level(level: ScopeLevel): ScopeLevel | undefined {
  const level_num = SCOPE_LEVEL_NUMBERS[level];
  if (level_num === 1) return undefined;
  return `hazo_scopes_l${level_num - 1}` as ScopeLevel;
}

/**
 * Gets the child level for a given scope level
 * Returns undefined for L7 (leaf level)
 */
export function get_child_level(level: ScopeLevel): ScopeLevel | undefined {
  const level_num = SCOPE_LEVEL_NUMBERS[level];
  if (level_num === 7) return undefined;
  return `hazo_scopes_l${level_num + 1}` as ScopeLevel;
}

/**
 * Gets all scopes for a given level, optionally filtered by organization
 */
export async function get_scopes_by_level(
  adapter: HazoConnectAdapter,
  level: ScopeLevel,
  org?: string,
): Promise<ScopeServiceResult> {
  try {
    const scope_service = createCrudService(adapter, level);

    let scopes: unknown[];
    if (org) {
      scopes = await scope_service.findBy({ org });
    } else {
      scopes = await scope_service.findBy({});
    }

    if (!Array.isArray(scopes)) {
      return {
        success: true,
        scopes: [],
      };
    }

    return {
      success: true,
      scopes: scopes as ScopeRecord[],
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "scope_service.ts",
        line_number: 0,
        operation: "get_scopes_by_level",
        level,
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
 * Gets a single scope by ID
 */
export async function get_scope_by_id(
  adapter: HazoConnectAdapter,
  level: ScopeLevel,
  scope_id: string,
): Promise<ScopeServiceResult> {
  try {
    const scope_service = createCrudService(adapter, level);
    const scopes = await scope_service.findBy({ id: scope_id });

    if (!Array.isArray(scopes) || scopes.length === 0) {
      return {
        success: false,
        error: "Scope not found",
      };
    }

    return {
      success: true,
      scope: scopes[0] as ScopeRecord,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "scope_service.ts",
        line_number: 0,
        operation: "get_scope_by_id",
        level,
        scope_id,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Gets a single scope by seq (friendly ID)
 */
export async function get_scope_by_seq(
  adapter: HazoConnectAdapter,
  level: ScopeLevel,
  seq: string,
): Promise<ScopeServiceResult> {
  try {
    const scope_service = createCrudService(adapter, level);
    const scopes = await scope_service.findBy({ seq });

    if (!Array.isArray(scopes) || scopes.length === 0) {
      return {
        success: false,
        error: "Scope not found",
      };
    }

    return {
      success: true,
      scope: scopes[0] as ScopeRecord,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "scope_service.ts",
        line_number: 0,
        operation: "get_scope_by_seq",
        level,
        seq,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Creates a new scope
 * Note: The seq field is auto-generated by the database via hazo_scope_id_generator function
 */
export async function create_scope(
  adapter: HazoConnectAdapter,
  level: ScopeLevel,
  data: CreateScopeData,
): Promise<ScopeServiceResult> {
  try {
    const scope_service = createCrudService(adapter, level);
    const now = new Date().toISOString();

    // Validate parent_scope_id is required for L2-L7
    const parent_level = get_parent_level(level);
    if (parent_level && !data.parent_scope_id) {
      return {
        success: false,
        error: `parent_scope_id is required for ${level}`,
      };
    }

    // Validate parent exists if provided
    if (data.parent_scope_id && parent_level) {
      const parent_result = await get_scope_by_id(
        adapter,
        parent_level,
        data.parent_scope_id,
      );
      if (!parent_result.success) {
        return {
          success: false,
          error: "Parent scope not found",
        };
      }
    }

    const insert_data: Record<string, unknown> = {
      org: data.org,
      name: data.name,
      created_at: now,
      changed_at: now,
    };

    if (data.parent_scope_id) {
      insert_data.parent_scope_id = data.parent_scope_id;
    }

    const inserted = await scope_service.insert(insert_data);

    if (!Array.isArray(inserted) || inserted.length === 0) {
      return {
        success: false,
        error: "Failed to create scope",
      };
    }

    return {
      success: true,
      scope: inserted[0] as ScopeRecord,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "scope_service.ts",
        line_number: 0,
        operation: "create_scope",
        level,
        data,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Updates an existing scope
 */
export async function update_scope(
  adapter: HazoConnectAdapter,
  level: ScopeLevel,
  scope_id: string,
  data: UpdateScopeData,
): Promise<ScopeServiceResult> {
  try {
    const scope_service = createCrudService(adapter, level);
    const now = new Date().toISOString();

    // Check scope exists
    const existing = await get_scope_by_id(adapter, level, scope_id);
    if (!existing.success) {
      return existing;
    }

    // Validate parent if being changed
    if (data.parent_scope_id !== undefined) {
      const parent_level = get_parent_level(level);
      if (parent_level && data.parent_scope_id) {
        const parent_result = await get_scope_by_id(
          adapter,
          parent_level,
          data.parent_scope_id,
        );
        if (!parent_result.success) {
          return {
            success: false,
            error: "Parent scope not found",
          };
        }
      }
    }

    const update_data: Record<string, unknown> = {
      changed_at: now,
    };

    if (data.name !== undefined) {
      update_data.name = data.name;
    }

    if (data.parent_scope_id !== undefined) {
      update_data.parent_scope_id = data.parent_scope_id;
    }

    const updated = await scope_service.updateById(scope_id, update_data);

    if (!Array.isArray(updated) || updated.length === 0) {
      return {
        success: false,
        error: "Failed to update scope",
      };
    }

    return {
      success: true,
      scope: updated[0] as ScopeRecord,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "scope_service.ts",
        line_number: 0,
        operation: "update_scope",
        level,
        scope_id,
        data,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Deletes a scope (cascades to children via database FK constraints)
 */
export async function delete_scope(
  adapter: HazoConnectAdapter,
  level: ScopeLevel,
  scope_id: string,
): Promise<ScopeServiceResult> {
  try {
    const scope_service = createCrudService(adapter, level);

    // Check scope exists
    const existing = await get_scope_by_id(adapter, level, scope_id);
    if (!existing.success) {
      return existing;
    }

    await scope_service.deleteById(scope_id);

    return {
      success: true,
      scope: existing.scope,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "scope_service.ts",
        line_number: 0,
        operation: "delete_scope",
        level,
        scope_id,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Gets immediate children of a scope
 */
export async function get_scope_children(
  adapter: HazoConnectAdapter,
  level: ScopeLevel,
  scope_id: string,
): Promise<ScopeServiceResult> {
  try {
    const child_level = get_child_level(level);
    if (!child_level) {
      return {
        success: true,
        scopes: [], // L7 has no children
      };
    }

    const child_service = createCrudService(adapter, child_level);
    const children = await child_service.findBy({ parent_scope_id: scope_id });

    return {
      success: true,
      scopes: Array.isArray(children) ? (children as ScopeRecord[]) : [],
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "scope_service.ts",
        line_number: 0,
        operation: "get_scope_children",
        level,
        scope_id,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Gets all ancestors of a scope up to L1 (root)
 * Returns array ordered from immediate parent to root (L1)
 */
export async function get_scope_ancestors(
  adapter: HazoConnectAdapter,
  level: ScopeLevel,
  scope_id: string,
): Promise<ScopeServiceResult> {
  try {
    const ancestors: ScopeRecord[] = [];

    // Get the scope first
    const scope_result = await get_scope_by_id(adapter, level, scope_id);
    if (!scope_result.success || !scope_result.scope) {
      return scope_result;
    }

    let current_scope = scope_result.scope;
    let current_level = level;

    // Walk up the hierarchy
    while (current_scope.parent_scope_id) {
      const parent_level = get_parent_level(current_level);
      if (!parent_level) break;

      const parent_result = await get_scope_by_id(
        adapter,
        parent_level,
        current_scope.parent_scope_id,
      );

      if (!parent_result.success || !parent_result.scope) break;

      ancestors.push(parent_result.scope);
      current_scope = parent_result.scope;
      current_level = parent_level;
    }

    return {
      success: true,
      scopes: ancestors,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "scope_service.ts",
        line_number: 0,
        operation: "get_scope_ancestors",
        level,
        scope_id,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Gets all descendants of a scope down to L7 (leaves)
 * Returns flat array of all descendant scopes
 */
export async function get_scope_descendants(
  adapter: HazoConnectAdapter,
  level: ScopeLevel,
  scope_id: string,
): Promise<ScopeServiceResult> {
  try {
    const descendants: ScopeRecord[] = [];

    // Recursive function to get all children
    async function collect_descendants(
      current_level: ScopeLevel,
      current_id: string,
    ): Promise<void> {
      const children_result = await get_scope_children(
        adapter,
        current_level,
        current_id,
      );

      if (children_result.success && children_result.scopes) {
        for (const child of children_result.scopes) {
          descendants.push(child);
          const child_level = get_child_level(current_level);
          if (child_level) {
            await collect_descendants(child_level, child.id);
          }
        }
      }
    }

    await collect_descendants(level, scope_id);

    return {
      success: true,
      scopes: descendants,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "scope_service.ts",
        line_number: 0,
        operation: "get_scope_descendants",
        level,
        scope_id,
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}

/**
 * Gets scope hierarchy tree for a given organization
 * Returns nested structure starting from L1
 */
export type ScopeTreeNode = ScopeRecord & {
  children?: ScopeTreeNode[];
  level: ScopeLevel;
};

/**
 * Organization tree node that groups scopes by organization
 */
export type OrgScopeTreeNode = {
  id: string;
  name: string;
  org: string;
  isOrgNode: true;
  children: ScopeTreeNode[];
};

export async function get_scope_tree(
  adapter: HazoConnectAdapter,
  org: string,
): Promise<{ success: boolean; tree?: ScopeTreeNode[]; error?: string }> {
  try {
    // Get all L1 scopes for this org
    const l1_result = await get_scopes_by_level(adapter, "hazo_scopes_l1", org);
    if (!l1_result.success || !l1_result.scopes) {
      return l1_result;
    }

    // Build tree recursively
    async function build_tree(
      scope: ScopeRecord,
      level: ScopeLevel,
    ): Promise<ScopeTreeNode> {
      const node: ScopeTreeNode = {
        ...scope,
        level,
        children: [],
      };

      const children_result = await get_scope_children(adapter, level, scope.id);
      if (children_result.success && children_result.scopes) {
        const child_level = get_child_level(level);
        if (child_level) {
          for (const child of children_result.scopes) {
            const child_node = await build_tree(child, child_level);
            node.children!.push(child_node);
          }
        }
      }

      return node;
    }

    const tree: ScopeTreeNode[] = [];
    for (const l1_scope of l1_result.scopes) {
      const node = await build_tree(l1_scope, "hazo_scopes_l1");
      tree.push(node);
    }

    return {
      success: true,
      tree,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "scope_service.ts",
        line_number: 0,
        operation: "get_scope_tree",
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
 * Gets all scope trees across all organizations
 * Returns trees for all L1 scopes (top level)
 */
export async function get_all_scope_trees(
  adapter: HazoConnectAdapter,
): Promise<{ success: boolean; trees?: ScopeTreeNode[]; error?: string }> {
  try {
    // Get all L1 scopes (no org filter)
    const l1_result = await get_scopes_by_level(adapter, "hazo_scopes_l1");
    if (!l1_result.success || !l1_result.scopes) {
      return { success: true, trees: [] };
    }

    // Build tree recursively
    async function build_tree(
      scope: ScopeRecord,
      level: ScopeLevel,
    ): Promise<ScopeTreeNode> {
      const node: ScopeTreeNode = {
        ...scope,
        level,
        children: [],
      };

      const children_result = await get_scope_children(adapter, level, scope.id);
      if (children_result.success && children_result.scopes) {
        const child_level = get_child_level(level);
        if (child_level) {
          for (const child of children_result.scopes) {
            const child_node = await build_tree(child, child_level);
            node.children!.push(child_node);
          }
        }
      }

      return node;
    }

    // Build trees for all L1 scopes
    const trees: ScopeTreeNode[] = [];
    for (const scope of l1_result.scopes) {
      const scopeTree = await build_tree(scope, "hazo_scopes_l1");
      trees.push(scopeTree);
    }

    return {
      success: true,
      trees,
    };
  } catch (error) {
    const logger = create_app_logger();
    const error_message = sanitize_error_for_user(error, {
      logToConsole: true,
      logToLogger: true,
      logger,
      context: {
        filename: "scope_service.ts",
        line_number: 0,
        operation: "get_all_scope_trees",
      },
    });

    return {
      success: false,
      error: error_message,
    };
  }
}
