// file_description: server-only helper to read HRBAC scope hierarchy configuration from hazo_auth_config.ini
// section: imports
import {
  get_config_value,
  get_config_number,
  get_config_boolean,
} from "./config/config_loader.server";
import { SUPER_ADMIN_SCOPE_ID, DEFAULT_SYSTEM_SCOPE_ID } from "./services/scope_service";

// section: types

/**
 * Scope hierarchy configuration options for HRBAC
 * Uses unified hazo_scopes table with parent_id for hierarchy
 */
export type ScopeHierarchyConfig = {
  /** Whether HRBAC is enabled (default: false) */
  enable_hrbac: boolean;
  /** Cache TTL in minutes for scope lookups (default: 15) */
  scope_cache_ttl_minutes: number;
  /** Maximum entries in scope cache (default: 5000) */
  scope_cache_max_entries: number;
  /** Super admin scope ID */
  super_admin_scope_id: string;
  /** Default system scope ID (for non-multi-tenancy mode) */
  default_system_scope_id: string;
};

// section: constants

const SECTION_NAME = "hazo_auth__scope_hierarchy";

// section: helpers

/**
 * Reads HRBAC scope hierarchy configuration from hazo_auth_config.ini file
 * Falls back to defaults if config file is not found or section is missing
 * @returns Scope hierarchy configuration options
 */
export function get_scope_hierarchy_config(): ScopeHierarchyConfig {
  // Core HRBAC enablement
  const enable_hrbac = get_config_boolean(SECTION_NAME, "enable_hrbac", false);

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

  // Scope IDs (with defaults)
  const super_admin_scope_id = get_config_value(
    SECTION_NAME,
    "super_admin_scope_id",
    SUPER_ADMIN_SCOPE_ID,
  );
  const default_system_scope_id = get_config_value(
    SECTION_NAME,
    "default_system_scope_id",
    DEFAULT_SYSTEM_SCOPE_ID,
  );

  return {
    enable_hrbac,
    scope_cache_ttl_minutes,
    scope_cache_max_entries,
    super_admin_scope_id,
    default_system_scope_id,
  };
}

/**
 * Checks if HRBAC is enabled in the configuration
 * Convenience function for quick checks
 */
export function is_hrbac_enabled(): boolean {
  return get_config_boolean(SECTION_NAME, "enable_hrbac", false);
}
