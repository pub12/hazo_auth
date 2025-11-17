// file_description: server-only helper to create hazo_connect instance (imports server-side code)
// This file should only be imported in server contexts (API routes, server components)
// Reads configuration from hazo_auth_config.ini using hazo_config
// section: imports
import { createHazoConnect } from "hazo_connect/server";
import { HazoConfig } from "hazo_config/dist/lib";
import path from "path";
import fs from "fs";
import { create_app_logger } from "./app_logger";
import { read_config_section } from "./config/config_loader.server";

// section: helpers
/**
 * Reads hazo_connect configuration from hazo_auth_config.ini file
 * Falls back to environment variables if hazo_auth_config.ini is not found or section is missing
 * @returns Configuration options for hazo_connect
 */
function get_hazo_connect_config(): {
  type: "sqlite" | "postgrest";
  sqlitePath?: string;
  enableAdminUi: boolean;
  readOnly?: boolean;
  postgrestUrl?: string;
  postgrestApiKey?: string;
} {
  const default_config_path = path.resolve(process.cwd(), "hazo_auth_config.ini");
  let hazo_connect_section: Record<string, string> | undefined;

  // Try to read from hazo_auth_config.ini
  const logger = create_app_logger();
  hazo_connect_section = read_config_section("hazo_connect");

  // Read type (defaults to sqlite)
  const type = (
    hazo_connect_section?.type ||
    process.env.HAZO_CONNECT_TYPE ||
    "sqlite"
  ).toLowerCase() as "sqlite" | "postgrest";

  // Read enable_admin_ui (defaults to true)
  const enable_admin_ui_str =
    hazo_connect_section?.enable_admin_ui ||
    process.env.HAZO_CONNECT_ENABLE_ADMIN_UI ||
    "true";
  const enableAdminUi = enable_admin_ui_str.toLowerCase() === "true";

  // Read read_only (defaults to false)
  const read_only_str =
    hazo_connect_section?.read_only ||
    process.env.HAZO_CONNECT_SQLITE_READONLY ||
    "false";
  const readOnly = read_only_str.toLowerCase() === "true";

  // SQLite configuration
  if (type === "sqlite") {
    const sqlite_path_config =
      hazo_connect_section?.sqlite_path || process.env.HAZO_CONNECT_SQLITE_PATH;

    let sqlite_path: string | undefined;

    if (sqlite_path_config) {
      // If path is absolute, use as-is; otherwise resolve relative to process.cwd()
      sqlite_path = path.isAbsolute(sqlite_path_config)
        ? sqlite_path_config
        : path.resolve(process.cwd(), sqlite_path_config);

      // Normalize the path to ensure consistency (resolves .., ., etc.)
      sqlite_path = path.normalize(sqlite_path);
    } else {
      // Fallback to test fixture database
      const fallback_sqlite_path = path.resolve(
        process.cwd(),
        "__tests__",
        "fixtures",
        "hazo_auth.sqlite"
      );
      sqlite_path = path.normalize(fallback_sqlite_path);
    }

    // Log the resolved path for debugging
    logger.debug("hazo_connect_sqlite_path_resolved", {
      filename: "hazo_connect_setup.server.ts",
      line_number: 0,
      sqlite_path,
      process_cwd: process.cwd(),
      config_source: hazo_connect_section ? "hazo_auth_config.ini" : "environment variables",
    });

    return {
      type: "sqlite",
      sqlitePath: sqlite_path,
      enableAdminUi,
      readOnly,
    };
  }

  // PostgREST configuration
  if (type === "postgrest") {
    const postgrest_url =
      hazo_connect_section?.postgrest_url ||
      process.env.HAZO_CONNECT_POSTGREST_URL ||
      process.env.POSTGREST_URL;
    const postgrest_api_key =
      hazo_connect_section?.postgrest_api_key ||
      process.env.HAZO_CONNECT_POSTGREST_API_KEY ||
      process.env.POSTGREST_API_KEY;

    if (!postgrest_url) {
      throw new Error(
        "PostgREST URL is required. Set postgrest_url in [hazo_connect] section of hazo_auth_config.ini or HAZO_CONNECT_POSTGREST_URL environment variable."
      );
    }

    return {
      type: "postgrest",
      postgrestUrl: postgrest_url,
      postgrestApiKey: postgrest_api_key,
      enableAdminUi,
    };
  }

  throw new Error(
    `Unsupported HAZO_CONNECT_TYPE: ${type}. Supported types: sqlite, postgrest`
  );
}

/**
 * Server-only function to create hazo_connect adapter
 * Reads configuration from hazo_auth_config.ini using hazo_config, falls back to environment variables
 * This should only be called from server-side code (API routes, server components)
 */
export function create_sqlite_hazo_connect_server() {
  const config = get_hazo_connect_config();

  if (config.type === "sqlite") {
    return createHazoConnect({
      type: "sqlite",
      database: config.sqlitePath!,
      enable_admin_ui: config.enableAdminUi,
    });
  }

  if (config.type === "postgrest") {
    return createHazoConnect({
      type: "postgrest",
      baseUrl: config.postgrestUrl!,
      apiKey: config.postgrestApiKey,
    });
  }

  throw new Error(`Unsupported database type: ${config.type}`);
}

/**
 * Gets hazo_connect configuration options for use with singleton API
 * Reads from hazo_auth_config.ini using hazo_config, falls back to environment variables
 * @returns Configuration options compatible with getHazoConnectSingleton
 */
export function get_hazo_connect_config_options(): {
  type?: "sqlite" | "postgrest";
  sqlitePath?: string;
  enableAdminUi?: boolean;
  readOnly?: boolean;
} {
  const config = get_hazo_connect_config();

  if (config.type === "sqlite") {
    return {
      type: "sqlite",
      sqlitePath: config.sqlitePath,
      enableAdminUi: config.enableAdminUi,
      readOnly: config.readOnly,
    };
  }

  // PostgREST is not supported by the singleton API options yet
  // Return empty object to let it use environment variables
  return {};
}

