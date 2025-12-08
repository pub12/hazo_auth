// file_description: server-only helper to read HRBAC scope hierarchy configuration from hazo_auth_config.ini
// section: imports
import {
  get_config_value,
  get_config_number,
  get_config_boolean,
  get_config_array,
} from "./config/config_loader.server";
import type { ScopeLevel } from "./services/scope_service";
import { SCOPE_LEVELS } from "./services/scope_service";

// section: types

/**
 * Scope hierarchy configuration options for HRBAC
 */
export type ScopeHierarchyConfig = {
  /** Whether HRBAC is enabled (default: false) */
  enable_hrbac: boolean;
  /** Default organization for single-tenant apps (optional) */
  default_org: string;
  /** Cache TTL in minutes for scope lookups (default: 15) */
  scope_cache_ttl_minutes: number;
  /** Maximum entries in scope cache (default: 5000) */
  scope_cache_max_entries: number;
  /** Which scope levels are active/enabled */
  active_levels: ScopeLevel[];
  /** Default labels for each scope level */
  default_labels: Record<ScopeLevel, string>;
};

// section: constants

const SECTION_NAME = "hazo_auth__scope_hierarchy";

const DEFAULT_LABELS: Record<ScopeLevel, string> = {
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
 * Parses the active_levels config value into an array of ScopeLevel
 * If not configured, returns all levels
 */
function parse_active_levels(config_value: string): ScopeLevel[] {
  if (!config_value || config_value.trim().length === 0) {
    return [...SCOPE_LEVELS]; // All levels active by default
  }

  const levels = config_value.split(",").map((s) => s.trim());
  const valid_levels: ScopeLevel[] = [];

  for (const level of levels) {
    if (SCOPE_LEVELS.includes(level as ScopeLevel)) {
      valid_levels.push(level as ScopeLevel);
    }
  }

  return valid_levels.length > 0 ? valid_levels : [...SCOPE_LEVELS];
}

/**
 * Reads default labels from config, falling back to defaults
 */
function get_default_labels(): Record<ScopeLevel, string> {
  const labels = { ...DEFAULT_LABELS };

  for (let i = 1; i <= 7; i++) {
    const level = `hazo_scopes_l${i}` as ScopeLevel;
    const config_key = `default_label_l${i}`;
    const config_value = get_config_value(SECTION_NAME, config_key, "");

    if (config_value && config_value.trim().length > 0) {
      labels[level] = config_value.trim();
    }
  }

  return labels;
}

/**
 * Reads HRBAC scope hierarchy configuration from hazo_auth_config.ini file
 * Falls back to defaults if config file is not found or section is missing
 * @returns Scope hierarchy configuration options
 */
export function get_scope_hierarchy_config(): ScopeHierarchyConfig {
  // Core HRBAC enablement
  const enable_hrbac = get_config_boolean(SECTION_NAME, "enable_hrbac", false);

  // Default organization for single-tenant apps
  const default_org = get_config_value(SECTION_NAME, "default_org", "");

  // Cache settings
  const scope_cache_ttl_minutes = get_config_number(
    SECTION_NAME,
    "scope_cache_ttl_minutes",
    15,
  );
  const scope_cache_max_entries = get_config_number(
    SECTION_NAME,
    "scope_cache_max_entries",
    5000,
  );

  // Active levels
  const active_levels_str = get_config_value(SECTION_NAME, "active_levels", "");
  const active_levels = parse_active_levels(active_levels_str);

  // Default labels
  const default_labels = get_default_labels();

  return {
    enable_hrbac,
    default_org,
    scope_cache_ttl_minutes,
    scope_cache_max_entries,
    active_levels,
    default_labels,
  };
}

/**
 * Checks if HRBAC is enabled in the configuration
 * Convenience function for quick checks
 */
export function is_hrbac_enabled(): boolean {
  return get_config_boolean(SECTION_NAME, "enable_hrbac", false);
}

/**
 * Gets the default organization from config
 * Returns empty string if not configured (multi-tenant mode)
 */
export function get_default_org(): string {
  return get_config_value(SECTION_NAME, "default_org", "");
}

/**
 * Gets the default label for a scope level
 */
export function get_default_label(level: ScopeLevel): string {
  const config_key = `default_label_l${level.charAt(level.length - 1)}`;
  return get_config_value(SECTION_NAME, config_key, DEFAULT_LABELS[level]);
}
