// file_description: CLI command to initialize permissions from configuration
// section: imports
import { randomUUID } from "crypto";
import { get_hazo_connect_instance } from "../lib/hazo_connect_instance.server.js";
import { createCrudService } from "hazo_connect/server";
import { get_user_management_config } from "../lib/user_management_config.server.js";
import { create_app_logger } from "../lib/app_logger.js";

// section: types
type InitPermissionsSummary = {
  inserted: string[];
  existing: string[];
};

// section: helpers
/**
 * Prints a summary of what was inserted vs what already existed
 */
function print_summary(summary: InitPermissionsSummary): void {
  console.log("=".repeat(60));
  console.log("INITIALIZATION SUMMARY");
  console.log("=".repeat(60));
  console.log();

  if (summary.inserted.length > 0) {
    console.log(`✓ Inserted (${summary.inserted.length}):`);
    summary.inserted.forEach((name) => console.log(`  - ${name}`));
  }

  if (summary.existing.length > 0) {
    console.log(`⊙ Already existed (${summary.existing.length}):`);
    summary.existing.forEach((name) => console.log(`  - ${name}`));
  }

  if (summary.inserted.length === 0 && summary.existing.length === 0) {
    console.log("No permissions found in configuration.");
  }

  console.log();
  console.log("=".repeat(60));
}

// section: main_function
/**
 * Initializes permissions from configuration
 * This function reads from hazo_auth_config.ini and sets up permissions
 * without requiring any users to exist.
 */
export async function handle_init_permissions(): Promise<void> {
  const logger = create_app_logger();
  const summary: InitPermissionsSummary = {
    inserted: [],
    existing: [],
  };

  try {
    console.log("\n🐸 hazo_auth init-permissions\n");
    console.log("Creating permissions from configuration...\n");

    // Get hazo_connect instance
    const hazoConnect = get_hazo_connect_instance();
    const permissions_service = createCrudService(hazoConnect, "hazo_permissions");

    // Get permissions from config
    const config = get_user_management_config();
    const permission_names = config.application_permission_list_defaults || [];

    if (permission_names.length === 0) {
      console.log("⚠ No permissions found in configuration.");
      console.log("  Add permissions to [hazo_auth__user_management] application_permission_list_defaults\n");
      return;
    }

    console.log(`Found ${permission_names.length} permission(s) in configuration:`);
    permission_names.forEach((name) => console.log(`  - ${name}`));
    console.log();

    // Add permissions to hazo_permissions table
    const now = new Date().toISOString();

    for (const permission_name of permission_names) {
      const trimmed_name = permission_name.trim();
      if (!trimmed_name) continue;

      // Check if permission already exists
      const existing_permissions = await permissions_service.findBy({
        permission_name: trimmed_name,
      });

      if (Array.isArray(existing_permissions) && existing_permissions.length > 0) {
        const existing_permission = existing_permissions[0];
        const perm_id = existing_permission.id as string;
        summary.existing.push(trimmed_name);
        console.log(`⊙ Permission already exists: ${trimmed_name} (ID: ${perm_id})`);
      } else {
        // Insert new permission with generated UUID
        const perm_id = randomUUID();
        await permissions_service.insert({
          id: perm_id,
          permission_name: trimmed_name,
          description: `Permission for ${trimmed_name}`,
          created_at: now,
          changed_at: now,
        });

        summary.inserted.push(trimmed_name);
        console.log(`✓ Inserted permission: ${trimmed_name} (ID: ${perm_id})`);
      }
    }

    console.log();

    // Print summary
    print_summary(summary);

    logger.info("init_permissions_completed", {
      filename: "init_permissions.ts",
      line_number: 0,
      summary,
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    const error_stack = error instanceof Error ? error.stack : undefined;

    console.error("\n✗ Error initializing permissions:");
    console.error(`  ${error_message}`);
    if (error_stack) {
      console.error("\nStack trace:");
      console.error(error_stack);
    }

    logger.error("init_permissions_failed", {
      filename: "init_permissions.ts",
      line_number: 0,
      error_message,
      error_stack,
    });

    process.exit(1);
  }
}

// section: help
/**
 * Shows help for the init-permissions command
 */
export function show_init_permissions_help(): void {
  console.log(`
hazo_auth init-permissions

Create default permissions from configuration.

This command reads permissions from hazo_auth_config.ini and inserts them
into the hazo_permissions table. Does not require any users to exist.

Configuration required in hazo_auth_config.ini:

  [hazo_auth__user_management]
  application_permission_list_defaults = admin_user_management,admin_role_management,...

Usage:
  npx hazo_auth init-permissions
`);
}
