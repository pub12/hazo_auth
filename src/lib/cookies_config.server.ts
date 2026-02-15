// file_description: server-only helper to read cookie configuration from hazo_auth_config.ini
// section: server-only-guard
import "server-only";


import { read_config_section } from "./config/config_loader.server";

// section: types
export type CookiesConfig = {
  /** Prefix for all hazo_auth cookies (e.g., "myapp_" results in "myapp_hazo_auth_session") */
  cookie_prefix: string;
  /** Optional domain for cookies (e.g., ".example.com" for cross-subdomain) */
  cookie_domain: string;
};

// section: defaults
const DEFAULT_CONFIG: CookiesConfig = {
  cookie_prefix: "",
  cookie_domain: "",
};

// section: constants
const SECTION_NAME = "hazo_auth__cookies";

// Base cookie names (without prefix)
export const BASE_COOKIE_NAMES = {
  USER_ID: "hazo_auth_user_id",
  USER_EMAIL: "hazo_auth_user_email",
  SESSION: "hazo_auth_session",
  DEV_LOCK: "hazo_auth_dev_lock",
  SCOPE_ID: "hazo_auth_scope_id", // v5.2: Tenant context cookie for multi-tenancy
} as const;

// section: main_function
/**
 * Reads cookie configuration from hazo_auth_config.ini file
 * cookie_prefix is REQUIRED - throws if not configured
 * @returns CookiesConfig object with all cookie settings
 */
export function get_cookies_config(): CookiesConfig {
  const section = read_config_section(SECTION_NAME);
  const cookie_prefix = section?.cookie_prefix || "";

  if (!cookie_prefix) {
    throw new Error(
      "[hazo_auth] cookie_prefix is required but not configured.\n" +
      "Set cookie_prefix in [hazo_auth__cookies] section of config/hazo_auth_config.ini:\n\n" +
      "  [hazo_auth__cookies]\n" +
      "  cookie_prefix = myapp_\n\n" +
      "Also set the matching environment variable for Edge runtime (middleware):\n" +
      "  HAZO_AUTH_COOKIE_PREFIX=myapp_\n\n" +
      "This prevents cookie conflicts between apps using hazo_auth."
    );
  }

  return {
    cookie_prefix,
    cookie_domain: section?.cookie_domain || DEFAULT_CONFIG.cookie_domain,
  };
}

/**
 * Gets the full cookie name with prefix applied
 * @param base_name - Base cookie name from BASE_COOKIE_NAMES
 * @returns Full cookie name with prefix
 */
export function get_cookie_name(base_name: string): string {
  const config = get_cookies_config();
  return `${config.cookie_prefix}${base_name}`;
}

/**
 * Gets cookie options with domain if configured
 * @param options - Base cookie options
 * @returns Cookie options with domain added if configured
 */
export function get_cookie_options<T extends Record<string, unknown>>(options: T): T & { domain?: string } {
  const config = get_cookies_config();

  if (config.cookie_domain) {
    return { ...options, domain: config.cookie_domain };
  }

  return options;
}

// Cached config for performance (module-level cache)
let cached_config: CookiesConfig | null = null;

/**
 * Gets cached cookie configuration for performance-critical paths
 * @returns CookiesConfig object
 */
export function get_cached_cookies_config(): CookiesConfig {
  if (!cached_config) {
    cached_config = get_cookies_config();
  }
  return cached_config;
}

/**
 * Clears the cached config (useful for testing)
 */
export function clear_cookies_config_cache(): void {
  cached_config = null;
}
