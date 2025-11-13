// file_description: API route to manually apply database migrations
// section: imports
import { NextRequest, NextResponse } from "next/server";
import { get_hazo_connect_instance } from "@/lib/hazo_connect_instance.server";
import { create_app_logger } from "@/lib/app_logger";
import fs from "fs";
import path from "path";
import { get_filename, get_line_number } from "@/lib/utils/api_route_helpers";

// section: api_handler
export async function POST(request: NextRequest) {
  const logger = create_app_logger();

  try {
    const body = await request.json();
    const { migration_file } = body;

    if (!migration_file) {
      return NextResponse.json(
        { error: "migration_file parameter is required" },
        { status: 400 }
      );
    }

    const migrations_dir = path.resolve(process.cwd(), "migrations");
    const migration_path = path.join(migrations_dir, migration_file);

    // Security check: ensure file is in migrations directory
    if (!migration_path.startsWith(migrations_dir)) {
      return NextResponse.json(
        { error: "Invalid migration file path" },
        { status: 400 }
      );
    }

    if (!fs.existsSync(migration_path)) {
      return NextResponse.json(
        { error: `Migration file not found: ${migration_file}` },
        { status: 404 }
      );
    }

    // Read the migration SQL
    const migration_sql = fs.readFileSync(migration_path, "utf-8");

    // Get hazo_connect instance
    const hazoConnect = get_hazo_connect_instance();

    // For SQLite, we need to execute raw SQL
    // Since hazo_connect doesn't expose raw SQL execution directly,
    // we'll need to use the SQLite admin API or a workaround
    // For now, return instructions to apply manually

    logger.info("migration_apply_requested", {
      filename: get_filename(),
      line_number: get_line_number(),
      migration_file,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Migration file read successfully. Please apply manually via SQLite Admin UI.",
        sql: migration_sql,
        instructions: [
          "1. Go to SQLite Admin UI at /hazo_connect/sqlite_admin",
          "2. Select the hazo_refresh_tokens table",
          "3. Use the SQL editor or execute the migration SQL manually",
          `4. Migration SQL is provided in the 'sql' field of this response`,
        ],
      },
      { status: 200 }
    );
  } catch (error) {
    const error_message = error instanceof Error ? error.message : "Unknown error";
    const error_stack = error instanceof Error ? error.stack : undefined;

    logger.error("migration_apply_error", {
      filename: get_filename(),
      line_number: get_line_number(),
      error_message,
      error_stack,
    });

    return NextResponse.json(
      { error: "Failed to process migration request" },
      { status: 500 }
    );
  }
}

