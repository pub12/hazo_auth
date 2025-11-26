// file_description: script to initialize users, roles, and permissions from configuration
// Run with: npx tsx scripts/init_users.ts init_users
// section: imports
import { get_hazo_connect_instance } from "../src/lib/hazo_connect_instance.server";
import { createCrudService } from "hazo_connect/server";
import { get_user_management_config } from "../src/lib/user_management_config.server";
import { get_config_value } from "../src/lib/config/config_loader.server";
import { create_app_logger } from "../src/lib/app_logger";

// section: types
type InitSummary = {
  permissions: {
    inserted: string[];
    existing: string[];
  };
  role: {
    inserted: boolean;
    existing: boolean;
    role_id: string | null;
  };
  role_permissions: {
    inserted: number;
    existing: number;
  };
  user_role: {
    inserted: boolean;
    existing: boolean;
  };
};

// section: helpers
/**
 * Displays help information for available commands
 */
function show_help(): void {
  console.log(`
hazo_auth CLI - User and Permission Management

Usage: npx tsx scripts/init_users.ts <command>

Available Commands:
  init_users    Initialize users, roles, and permissions from configuration
                - Reads permissions from hazo_auth_config.ini [hazo_auth__user_management] application_permission_list_defaults
                - Creates default_super_user_role in hazo_roles
                - Assigns all permissions to the super user role
                - Finds user by email from hazo_auth_config.ini [hazo_auth__initial_setup] default_super_user_email
                - Assigns super user role to the user
                - Provides summary of what was inserted vs what already existed

  help          Show this help message

Configuration:
  Add the following to hazo_auth_config.ini:

  [hazo_auth__user_management]
  application_permission_list_defaults = admin_user_management,admin_role_management,admin_permission_management

  [hazo_auth__initial_setup]
  default_super_user_email = admin@example.com

Examples:
  npx tsx scripts/init_users.ts init_users
  npx tsx scripts/init_users.ts help
`);
}

/**
 * Initializes users, roles, and permissions from configuration
 */
async function init_users(): Promise<void> {
  const logger = create_app_logger();
  const summary: InitSummary = {
    permissions: {
      inserted: [],
      existing: [],
    },
    role: {
      inserted: false,
      existing: false,
      role_id: null,
    },
    role_permissions: {
      inserted: 0,
      existing: 0,
    },
    user_role: {
      inserted: false,
      existing: false,
    },
  };

  try {
    console.log("Initializing users, roles, and permissions from configuration...\n");

    // Get hazo_connect instance
    const hazoConnect = get_hazo_connect_instance();
    const permissions_service = createCrudService(hazoConnect, "hazo_permissions");
    const roles_service = createCrudService(hazoConnect, "hazo_roles");
    const role_permissions_service = createCrudService(hazoConnect, "hazo_role_permissions");
    const users_service = createCrudService(hazoConnect, "hazo_users");
    const user_roles_service = createCrudService(hazoConnect, "hazo_user_roles");

    // 1. Get permissions from config
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

    // 2. Add permissions to hazo_permissions table
    const permission_id_map: Record<string, string> = {};
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
        permission_id_map[trimmed_name] = perm_id;
        summary.permissions.existing.push(trimmed_name);
        console.log(`✓ Permission already exists: ${trimmed_name} (ID: ${perm_id})`);
      } else {
        // Insert new permission
        const new_permission = await permissions_service.insert({
          permission_name: trimmed_name,
          description: `Permission for ${trimmed_name}`,
          created_at: now,
          changed_at: now,
        });

        const perm_id = Array.isArray(new_permission)
          ? (new_permission[0] as { id: string }).id
          : (new_permission as { id: string }).id;
        permission_id_map[trimmed_name] = perm_id;
        summary.permissions.inserted.push(trimmed_name);
        console.log(`✓ Inserted permission: ${trimmed_name} (ID: ${perm_id})`);
      }
    }

    console.log();

    // 3. Create or get default_super_user_role
    const role_name = "default_super_user_role";
    const existing_roles = await roles_service.findBy({
      role_name,
    });

    let role_id: string;
    if (Array.isArray(existing_roles) && existing_roles.length > 0) {
      role_id = existing_roles[0].id as string;
      summary.role.existing = true;
      summary.role.role_id = role_id;
      console.log(`✓ Role already exists: ${role_name} (ID: ${role_id})`);
    } else {
      const new_role = await roles_service.insert({
        role_name,
        created_at: now,
        changed_at: now,
      });

      role_id = Array.isArray(new_role)
        ? (new_role[0] as { id: string }).id
        : (new_role as { id: string }).id;
      summary.role.inserted = true;
      summary.role.role_id = role_id;
      console.log(`✓ Created role: ${role_name} (ID: ${role_id})`);
    }

    console.log();

    // 4. Assign all permissions to the role
    const permission_ids = Object.values(permission_id_map);

    for (const permission_id of permission_ids) {
      // Check if role-permission assignment already exists
      const existing_assignments = await role_permissions_service.findBy({
        role_id,
        permission_id,
      });

      if (Array.isArray(existing_assignments) && existing_assignments.length > 0) {
        summary.role_permissions.existing++;
        const perm_name = Object.keys(permission_id_map).find(
          (key) => permission_id_map[key] === permission_id,
        );
        console.log(`✓ Role-permission already exists: ${role_name} -> ${perm_name}`);
      } else {
        await role_permissions_service.insert({
          role_id,
          permission_id,
          created_at: now,
          changed_at: now,
        });
        summary.role_permissions.inserted++;
        const perm_name = Object.keys(permission_id_map).find(
          (key) => permission_id_map[key] === permission_id,
        );
        console.log(`✓ Assigned permission to role: ${role_name} -> ${perm_name}`);
      }
    }

    console.log();

    // 5. Get super user email from config
    const super_user_email = get_config_value(
      "hazo_auth__initial_setup",
      "default_super_user_email",
      "",
    ).trim();

    if (!super_user_email) {
      console.log("⚠ No super user email found in configuration.");
      console.log("  Add [hazo_auth__initial_setup] default_super_user_email to config\n");
      print_summary(summary);
      return;
    }

    console.log(`Looking up user with email: ${super_user_email}`);

    // 6. Find user by email
    const users = await users_service.findBy({
      email_address: super_user_email,
    });

    if (!Array.isArray(users) || users.length === 0) {
      console.log(`✗ User not found with email: ${super_user_email}`);
      console.log("  Please ensure the user exists in the database before running this script.\n");
      print_summary(summary);
      return;
    }

    const user = users[0];
    const user_id = user.id as string;
    console.log(`✓ Found user: ${super_user_email} (ID: ${user_id})`);
    console.log();

    // 7. Assign role to user
    const existing_user_roles = await user_roles_service.findBy({
      user_id,
      role_id,
    });

    if (Array.isArray(existing_user_roles) && existing_user_roles.length > 0) {
      summary.user_role.existing = true;
      console.log(`✓ User already has role assigned: ${user_id} -> ${role_name}`);
    } else {
      await user_roles_service.insert({
        user_id,
        role_id,
        created_at: now,
        changed_at: now,
      });
      summary.user_role.inserted = true;
      console.log(`✓ Assigned role to user: ${user_id} -> ${role_name}`);
    }

    console.log();

    // 8. Print summary
    print_summary(summary);

    logger.info("init_users_completed", {
      filename: "init_users.ts",
      line_number: 0,
      summary,
    });
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    const error_stack = error instanceof Error ? error.stack : undefined;

    console.error("\n✗ Error initializing users:");
    console.error(`  ${error_message}`);
    if (error_stack) {
      console.error("\nStack trace:");
      console.error(error_stack);
    }

    const logger = create_app_logger();
    logger.error("init_users_failed", {
      filename: "init_users.ts",
      line_number: 0,
      error_message,
      error_stack,
    });

    process.exit(1);
  }
}

/**
 * Prints a summary of what was inserted vs what already existed
 */
function print_summary(summary: InitSummary): void {
  console.log("=".repeat(60));
  console.log("INITIALIZATION SUMMARY");
  console.log("=".repeat(60));
  console.log();

  // Permissions summary
  console.log("Permissions:");
  if (summary.permissions.inserted.length > 0) {
    console.log(`  ✓ Inserted (${summary.permissions.inserted.length}):`);
    summary.permissions.inserted.forEach((name) => console.log(`    - ${name}`));
  }
  if (summary.permissions.existing.length > 0) {
    console.log(`  ⊙ Already existed (${summary.permissions.existing.length}):`);
    summary.permissions.existing.forEach((name) => console.log(`    - ${name}`));
  }
  console.log();

  // Role summary
  console.log("Role:");
  if (summary.role.inserted) {
    console.log(`  ✓ Inserted: default_super_user_role (ID: ${summary.role.role_id})`);
  }
  if (summary.role.existing) {
    console.log(`  ⊙ Already existed: default_super_user_role (ID: ${summary.role.role_id})`);
  }
  console.log();

  // Role permissions summary
  console.log("Role-Permission Assignments:");
  if (summary.role_permissions.inserted > 0) {
    console.log(`  ✓ Inserted: ${summary.role_permissions.inserted} assignment(s)`);
  }
  if (summary.role_permissions.existing > 0) {
    console.log(`  ⊙ Already existed: ${summary.role_permissions.existing} assignment(s)`);
  }
  console.log();

  // User role summary
  console.log("User-Role Assignment:");
  if (summary.user_role.inserted) {
    console.log(`  ✓ Inserted: Super user role assigned to user`);
  }
  if (summary.user_role.existing) {
    console.log(`  ⊙ Already existed: User already has super user role`);
  }
  console.log();

  console.log("=".repeat(60));
}

// section: main
function main(): void {
  const command = process.argv[2];

  if (!command || command === "help" || command === "--help" || command === "-h") {
    show_help();
    return;
  }

  if (command === "init_users") {
    void init_users();
  } else {
    console.error(`Unknown command: ${command}\n`);
    show_help();
    process.exit(1);
  }
}

main();


