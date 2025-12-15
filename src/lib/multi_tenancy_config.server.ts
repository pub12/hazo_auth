// file_description: server-only helper to read multi-tenancy configuration from hazo_auth_config.ini
// section: imports
import {
  get_config_value,
  get_config_number,
  get_config_boolean,
} from "./config/config_loader.server";
import { DEFAULT_MULTI_TENANCY } from "./config/default_config";

// section: types

/**
 * Multi-tenancy configuration options
 */
export type MultiTenancyConfig = {
  /** Whether multi-tenancy is enabled (default: false) */
  enable_multi_tenancy: boolean;
  /** Cache TTL in minutes for org lookups (default: 15) */
  org_cache_ttl_minutes: number;
  /** Maximum entries in org cache (default: 1000) */
  org_cache_max_entries: number;
  /** Default user limit per organization (0 = unlimited) */
  default_user_limit: number;
};

// section: constants

const SECTION_NAME = "hazo_auth__multi_tenancy";

// section: helpers

/**
 * Reads multi-tenancy configuration from hazo_auth_config.ini file
 * Falls back to defaults if config file is not found or section is missing
 * @returns Multi-tenancy configuration options
 */
export function get_multi_tenancy_config(): MultiTenancyConfig {
  // Core multi-tenancy enablement
  const enable_multi_tenancy = get_config_boolean(
    SECTION_NAME,
    "enable_multi_tenancy",
    DEFAULT_MULTI_TENANCY.enable_multi_tenancy,
  );

  // Cache settings
  const org_cache_ttl_minutes = get_config_number(
    SECTION_NAME,
    "org_cache_ttl_minutes",
    DEFAULT_MULTI_TENANCY.org_cache_ttl_minutes,
  );
  const org_cache_max_entries = get_config_number(
    SECTION_NAME,
    "org_cache_max_entries",
    DEFAULT_MULTI_TENANCY.org_cache_max_entries,
  );

  // Default user limit
  const default_user_limit = get_config_number(
    SECTION_NAME,
    "default_user_limit",
    DEFAULT_MULTI_TENANCY.default_user_limit,
  );

  return {
    enable_multi_tenancy,
    org_cache_ttl_minutes,
    org_cache_max_entries,
    default_user_limit,
  };
}

/**
 * Checks if multi-tenancy is enabled in the configuration
 * Convenience function for quick checks
 */
export function is_multi_tenancy_enabled(): boolean {
  return get_config_boolean(
    SECTION_NAME,
    "enable_multi_tenancy",
    DEFAULT_MULTI_TENANCY.enable_multi_tenancy,
  );
}

/**
 * Gets the default user limit from config
 * Returns 0 if not configured (unlimited)
 */
export function get_default_user_limit(): number {
  return get_config_number(
    SECTION_NAME,
    "default_user_limit",
    DEFAULT_MULTI_TENANCY.default_user_limit,
  );
}
