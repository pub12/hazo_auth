// file_description: CLI command to initialize users, roles, and permissions from configuration
// section: imports
import { get_hazo_connect_instance } from "../lib/hazo_connect_instance.server.js";
import { createCrudService } from "hazo_connect/server";
import { get_user_management_config } from "../lib/user_management_config.server.js";
import { get_config_value } from "../lib/config/config_loader.server.js";
import { create_app_logger } from "../lib/app_logger.js";
import { SUPER_ADMIN_SCOPE_ID } from "../lib/services/scope_service.js";
// section: helpers
/**
 * Prints a summary of what was inserted vs what already existed
 */
function print_summary(summary) {
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
    // v5.x: User-Role assignments are now handled via User-Scope assignments (see below)
    // Super admin scope summary
    console.log("Super Admin Scope:");
    if (summary.super_admin_scope.inserted) {
        console.log(`  ✓ Inserted: Super Admin scope (ID: ${SUPER_ADMIN_SCOPE_ID})`);
    }
    if (summary.super_admin_scope.existing) {
        console.log(`  ⊙ Already existed: Super Admin scope (ID: ${SUPER_ADMIN_SCOPE_ID})`);
    }
    console.log();
    // User scope summary
    console.log("User-Scope Assignment:");
    if (summary.user_scope.inserted) {
        console.log(`  ✓ Inserted: User assigned to Super Admin scope`);
    }
    if (summary.user_scope.existing) {
        console.log(`  ⊙ Already existed: User already in Super Admin scope`);
    }
    console.log();
    console.log("=".repeat(60));
}
// section: main_function
/**
 * Initializes users, roles, and permissions from configuration
 * This function reads from hazo_auth_config.ini and sets up:
 * 1. Permissions from [hazo_auth__user_management] application_permission_list_defaults
 * 2. A default_super_user_role with all permissions
 * 3. Assigns the role to user from --email parameter or [hazo_auth__initial_setup] default_super_user_email
 */
export async function handle_init_users(options = {}) {
    var _a;
    const logger = create_app_logger();
    const summary = {
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
        // v5.x: Removed user_role - roles are now assigned via hazo_user_scopes
        super_admin_scope: {
            inserted: false,
            existing: false,
        },
        user_scope: {
            inserted: false,
            existing: false,
        },
    };
    try {
        console.log("\n🐸 hazo_auth init-users\n");
        console.log("Initializing users, roles, and permissions from configuration...\n");
        // Get hazo_connect instance
        const hazoConnect = get_hazo_connect_instance();
        const permissions_service = createCrudService(hazoConnect, "hazo_permissions");
        const roles_service = createCrudService(hazoConnect, "hazo_roles");
        const role_permissions_service = createCrudService(hazoConnect, "hazo_role_permissions");
        const users_service = createCrudService(hazoConnect, "hazo_users");
        // v5.x: Removed hazo_user_roles - roles are now assigned via hazo_user_scopes
        const scopes_service = createCrudService(hazoConnect, "hazo_scopes");
        // hazo_user_scopes uses composite primary key (user_id, scope_id), no 'id' column
        const user_scopes_service = createCrudService(hazoConnect, "hazo_user_scopes", {
            primaryKeys: ["user_id", "scope_id"],
            autoId: false,
        });
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
        const permission_id_map = {};
        const now = new Date().toISOString();
        for (const permission_name of permission_names) {
            const trimmed_name = permission_name.trim();
            if (!trimmed_name)
                continue;
            // Check if permission already exists
            const existing_permissions = await permissions_service.findBy({
                permission_name: trimmed_name,
            });
            if (Array.isArray(existing_permissions) && existing_permissions.length > 0) {
                const existing_permission = existing_permissions[0];
                const perm_id = existing_permission.id;
                permission_id_map[trimmed_name] = perm_id;
                summary.permissions.existing.push(trimmed_name);
                console.log(`✓ Permission already exists: ${trimmed_name} (ID: ${perm_id})`);
            }
            else {
                // Insert new permission
                const new_permission = await permissions_service.insert({
                    permission_name: trimmed_name,
                    description: `Permission for ${trimmed_name}`,
                    created_at: now,
                    changed_at: now,
                });
                const perm_id = Array.isArray(new_permission)
                    ? new_permission[0].id
                    : new_permission.id;
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
        let role_id;
        if (Array.isArray(existing_roles) && existing_roles.length > 0) {
            role_id = existing_roles[0].id;
            summary.role.existing = true;
            summary.role.role_id = role_id;
            console.log(`✓ Role already exists: ${role_name} (ID: ${role_id})`);
        }
        else {
            const new_role = await roles_service.insert({
                role_name,
                created_at: now,
                changed_at: now,
            });
            role_id = Array.isArray(new_role)
                ? new_role[0].id
                : new_role.id;
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
                const perm_name = Object.keys(permission_id_map).find((key) => permission_id_map[key] === permission_id);
                console.log(`✓ Role-permission already exists: ${role_name} -> ${perm_name}`);
            }
            else {
                await role_permissions_service.insert({
                    role_id,
                    permission_id,
                    created_at: now,
                    changed_at: now,
                });
                summary.role_permissions.inserted++;
                const perm_name = Object.keys(permission_id_map).find((key) => permission_id_map[key] === permission_id);
                console.log(`✓ Assigned permission to role: ${role_name} -> ${perm_name}`);
            }
        }
        console.log();
        // 5. Get super user email from options or config
        const super_user_email = ((_a = options.email) === null || _a === void 0 ? void 0 : _a.trim()) || get_config_value("hazo_auth__initial_setup", "default_super_user_email", "").trim();
        if (!super_user_email) {
            console.log("⚠ No super user email provided.");
            console.log("  Either use --email=user@example.com parameter");
            console.log("  Or add [hazo_auth__initial_setup] default_super_user_email to config\n");
            print_summary(summary);
            return;
        }
        if (options.email) {
            console.log(`Using email from --email parameter: ${super_user_email}`);
        }
        else {
            console.log(`Using email from config: ${super_user_email}`);
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
        const user_id = user.id;
        console.log(`✓ Found user: ${super_user_email} (ID: ${user_id})`);
        console.log();
        // v5.x: Step 7 removed - role assignment now happens via hazo_user_scopes (see step 9)
        // 8. Ensure super admin scope exists
        const existing_scopes = await scopes_service.findBy({ id: SUPER_ADMIN_SCOPE_ID });
        if (Array.isArray(existing_scopes) && existing_scopes.length > 0) {
            summary.super_admin_scope.existing = true;
            console.log(`✓ Super Admin scope already exists (ID: ${SUPER_ADMIN_SCOPE_ID})`);
        }
        else {
            await scopes_service.insert({
                id: SUPER_ADMIN_SCOPE_ID,
                parent_id: null,
                name: "Super Admin",
                level: "system",
                created_at: now,
                changed_at: now,
            });
            summary.super_admin_scope.inserted = true;
            console.log(`✓ Created Super Admin scope (ID: ${SUPER_ADMIN_SCOPE_ID})`);
        }
        console.log();
        // 9. Assign user to super admin scope
        const existing_user_scopes = await user_scopes_service.findBy({
            user_id,
            scope_id: SUPER_ADMIN_SCOPE_ID,
        });
        if (Array.isArray(existing_user_scopes) && existing_user_scopes.length > 0) {
            summary.user_scope.existing = true;
            console.log(`✓ User already assigned to Super Admin scope`);
        }
        else {
            await user_scopes_service.insert({
                user_id,
                scope_id: SUPER_ADMIN_SCOPE_ID,
                root_scope_id: SUPER_ADMIN_SCOPE_ID,
                role_id,
                created_at: now,
                changed_at: now,
            });
            summary.user_scope.inserted = true;
            console.log(`✓ Assigned user to Super Admin scope`);
        }
        console.log();
        // 10. Print summary
        print_summary(summary);
        logger.info("init_users_completed", {
            filename: "init_users.ts",
            line_number: 0,
            summary,
        });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        const error_stack = error instanceof Error ? error.stack : undefined;
        console.error("\n✗ Error initializing users:");
        console.error(`  ${error_message}`);
        if (error_stack) {
            console.error("\nStack trace:");
            console.error(error_stack);
        }
        logger.error("init_users_failed", {
            filename: "init_users.ts",
            line_number: 0,
            error_message,
            error_stack,
        });
        process.exit(1);
    }
}
// section: help
/**
 * Shows help for the init-users command
 */
export function show_init_users_help() {
    console.log(`
hazo_auth init-users

Initialize users, roles, permissions, and super admin scope from configuration.

This command reads from hazo_auth_config.ini and:
  1. Creates permissions from [hazo_auth__user_management] application_permission_list_defaults
  2. Creates a 'default_super_user_role' role
  3. Assigns all permissions to the super user role
  4. Finds user by email (from --email parameter or config)
  5. Creates the Super Admin scope (${SUPER_ADMIN_SCOPE_ID})
  6. Assigns the user to the Super Admin scope with the super user role
     (v5.x: Roles are assigned per-scope via hazo_user_scopes table)

Options:
  --email=<email>    Email address of the user to assign super user role
                     (overrides [hazo_auth__initial_setup] default_super_user_email)
  --help, -h         Show this help message

Configuration required in hazo_auth_config.ini:

  [hazo_auth__user_management]
  application_permission_list_defaults = admin_user_management,admin_role_management,admin_permission_management

  [hazo_auth__initial_setup]
  default_super_user_email = admin@example.com   (optional if using --email)

Note: The user must already exist in the database (registered) before running this command.

Usage:
  npx hazo_auth init-users
  npx hazo_auth init-users --email=admin@example.com
`);
}
