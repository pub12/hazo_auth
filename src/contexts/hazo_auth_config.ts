// file_description: Type definitions for HazoAuth runtime configuration
// This file defines the configuration structure for the HazoAuthProvider context
// section: types

/**
 * Runtime configuration for hazo_auth components
 * Controls API paths and other runtime settings
 */
export type HazoAuthConfig = {
  /**
   * Base path for all hazo_auth API endpoints
   * @default "/api/hazo_auth"
   * @example "/api/v1/auth"
   */
  apiBasePath: string;
};

/**
 * Default configuration values
 * Used when no provider is present or when values are not specified
 */
export const DEFAULT_HAZO_AUTH_CONFIG: HazoAuthConfig = {
  apiBasePath: "/api/hazo_auth",
};
