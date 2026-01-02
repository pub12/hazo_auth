// file_description: API route handler for permissions management operations (list, migrate, update, delete)
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { get_hazo_connect_instance } from "../../lib/hazo_connect_instance.server";
import { createCrudService } from "hazo_connect/server";
import { create_app_logger } from "../../lib/app_logger";
import { get_filename, get_line_number } from "../../lib/utils/api_route_helpers";
import { get_user_management_config } from "../../lib/user_management_config.server";

// section: route_config
export const dynamic = 'force-dynamic';

// section: api_handler
/**
 * GET - Fetch all permissions from database and config
 */
export async function GET(request: NextRequest) {
  const logger = create_app_logger();

  try {
    const hazoConnect = get_hazo_connect_instance();
    const permissions_service = createCrudService(hazoConnect, "hazo_permissions");

    // Fetch all permissions from database (empty object means no filter - get all records)
    const db_permissions = await permissions_service.findBy({});

    if (!Array.isArray(db_permissions)) {
      return NextResponse.json(
        { error: "Failed to fetch permissions" },
        { status: 500 }
      );
    }

    // Get config permissions
    const config = get_user_management_config();
    const config_permission_names = config.application_permission_list_defaults || [];

    // Get DB permission names
    const db_permission_names = db_permissions.map((p) => p.permission_name as string);

    // Find config permissions not in DB
    const config_only_permissions = config_permission_names.filter(
      (name) => !db_permission_names.includes(name)
    );

    logger.info("user_management_permissions_fetched", {
      filename: get_filename(),
      line_number: get_line_number(),
      db_count: db_permissions.length,
      config_count: config_permission_names.length,
    });

    return NextResponse.json(
      {
        success: true,
        db_permissions: db_permissions.map((p) => ({
          id: p.id,
          permission_name: p.permission_name,
          description: p.description || "",
        })),
        config_permissions: config_only_permissions,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    const error_stack = error instanceof Error ? error.stack : undefined;

    logger.error("user_management_permissions_fetch_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
      error_stack,
    });

    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new permission or migrate config permissions to database
 */
export async function POST(request: NextRequest) {
  const logger = create_app_logger();

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // Handle migrate action
    if (action === "migrate") {
      const hazoConnect = get_hazo_connect_instance();
      const permissions_service = createCrudService(hazoConnect, "hazo_permissions");

      // Get config permissions
      const config = get_user_management_config();
      const config_permission_names = config.application_permission_list_defaults || [];

      if (config_permission_names.length === 0) {
        return NextResponse.json(
          {
            success: true,
            message: "No permissions to migrate",
            created: [],
            skipped: [],
          },
          { status: 200 }
        );
      }

      // Get existing permissions from DB (empty object means no filter - get all records)
      const db_permissions = await permissions_service.findBy({});
      const db_permission_names = Array.isArray(db_permissions)
        ? db_permissions.map((p) => p.permission_name as string)
        : [];

      const now = new Date().toISOString();
      const created: string[] = [];
      const skipped: string[] = [];

      // Migrate each config permission
      for (const permission_name of config_permission_names) {
        if (db_permission_names.includes(permission_name)) {
          // Skip if already exists
          skipped.push(permission_name);
          continue;
        }

        // Create new permission
        await permissions_service.insert({
          permission_name: permission_name.trim(),
          description: "",
          created_at: now,
          changed_at: now,
        });

        created.push(permission_name);
      }

      logger.info("user_management_permissions_migrated", {
        filename: get_filename(),
        line_number: get_line_number(),
        created_count: created.length,
        skipped_count: skipped.length,
      });

      return NextResponse.json(
        {
          success: true,
          created,
          skipped,
        },
        { status: 200 }
      );
    }

    // Handle create new permission
    const body = await request.json();
    const { permission_name, description } = body;

    if (!permission_name || typeof permission_name !== "string" || permission_name.trim().length === 0) {
      return NextResponse.json(
        { error: "permission_name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const hazoConnect = get_hazo_connect_instance();
    const permissions_service = createCrudService(hazoConnect, "hazo_permissions");

    // Check if permission already exists
    const existing_permissions = await permissions_service.findBy({
      permission_name: permission_name.trim(),
    });

    if (Array.isArray(existing_permissions) && existing_permissions.length > 0) {
      return NextResponse.json(
        { error: "Permission with this name already exists" },
        { status: 409 }
      );
    }

    // Create new permission
    const now = new Date().toISOString();
    const new_permission_result = await permissions_service.insert({
      permission_name: permission_name.trim(),
      description: (description || "").trim(),
      created_at: now,
      changed_at: now,
    });

    // insert() returns an array, get the first element
    if (!Array.isArray(new_permission_result) || new_permission_result.length === 0) {
      return NextResponse.json(
        { error: "Failed to create permission - no record returned" },
        { status: 500 }
      );
    }

    const new_permission = new_permission_result[0] as { id: number; permission_name: string; description: string };

    logger.info("user_management_permission_created", {
      filename: get_filename(),
      line_number: get_line_number(),
      permission_id: new_permission.id,
      permission_name: permission_name.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        permission: {
          id: new_permission.id,
          permission_name: permission_name.trim(),
          description: (description || "").trim(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    const error_stack = error instanceof Error ? error.stack : undefined;

    logger.error("user_management_permissions_post_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
      error_stack,
    });

    return NextResponse.json(
      { error: "Failed to create permission" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update permission description
 */
export async function PUT(request: NextRequest) {
  const logger = create_app_logger();

  try {
    const body = await request.json();
    const { permission_id, description } = body;

    if (!permission_id || typeof description !== "string") {
      return NextResponse.json(
        { error: "permission_id and description are required" },
        { status: 400 }
      );
    }

    const hazoConnect = get_hazo_connect_instance();
    const permissions_service = createCrudService(hazoConnect, "hazo_permissions");

    // Update permission with changed_at timestamp
    const now = new Date().toISOString();
    await permissions_service.updateById(permission_id, {
      description: description.trim(),
      changed_at: now,
    });

    logger.info("user_management_permission_updated", {
      filename: get_filename(),
      line_number: get_line_number(),
      permission_id,
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    const error_stack = error instanceof Error ? error.stack : undefined;

    logger.error("user_management_permission_update_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
      error_stack,
    });

    return NextResponse.json(
      { error: "Failed to update permission" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete permission from database
 */
export async function DELETE(request: NextRequest) {
  const logger = create_app_logger();

  try {
    const { searchParams } = new URL(request.url);
    const permission_id = searchParams.get("permission_id");

    if (!permission_id) {
      return NextResponse.json(
        { error: "permission_id is required" },
        { status: 400 }
      );
    }

    const permission_id_num = parseInt(permission_id, 10);
    if (isNaN(permission_id_num)) {
      return NextResponse.json(
        { error: "permission_id must be a number" },
        { status: 400 }
      );
    }

    const hazoConnect = get_hazo_connect_instance();
    const permissions_service = createCrudService(hazoConnect, "hazo_permissions");
    const role_permissions_service = createCrudService(hazoConnect, "hazo_role_permissions");

    // Check if permission is used in any role
    const role_permissions = await role_permissions_service.findBy({
      permission_id: permission_id_num,
    });

    if (Array.isArray(role_permissions) && role_permissions.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete permission that is assigned to roles" },
        { status: 409 }
      );
    }

    // Delete permission
    await permissions_service.deleteById(permission_id_num);

    logger.info("user_management_permission_deleted", {
      filename: get_filename(),
      line_number: get_line_number(),
      permission_id: permission_id_num,
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    const error_stack = error instanceof Error ? error.stack : undefined;

    logger.error("user_management_permission_delete_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
      error_stack,
    });

    return NextResponse.json(
      { error: "Failed to delete permission" },
      { status: 500 }
    );
  }
}
