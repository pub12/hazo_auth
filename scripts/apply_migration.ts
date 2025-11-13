// file_description: script to apply database migrations directly to SQLite database
// Run with: npx tsx scripts/apply_migration.ts
// section: imports
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// section: helpers
function get_database_path(): string {
  // Read from hazo_auth_config.ini or use default
  const config_path = path.resolve(process.cwd(), "hazo_auth_config.ini");
  let sqlite_path: string | undefined;

  if (fs.existsSync(config_path)) {
    try {
      const config_content = fs.readFileSync(config_path, "utf-8");
      const sqlite_path_match = config_content.match(/sqlite_path\s*=\s*(.+)/);
      if (sqlite_path_match) {
        sqlite_path = sqlite_path_match[1].trim();
      }
    } catch (error) {
      console.warn("Could not read hazo_auth_config.ini, using default path");
    }
  }

  // Default path if not found in config
  if (!sqlite_path) {
    sqlite_path = "__tests__/fixtures/hazo_auth.sqlite";
  }

  // Resolve to absolute path
  const resolved_path = path.isAbsolute(sqlite_path)
    ? sqlite_path
    : path.resolve(process.cwd(), sqlite_path);

  return path.normalize(resolved_path);
}

function apply_migration_sql(db: Database.Database, sql: string): void {
  // Remove comments (lines starting with --)
  const sql_without_comments = sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  // Split by semicolon and execute each statement
  const statements = sql_without_comments
    .split(";")
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0);

  console.log(`Found ${statements.length} SQL statement(s) to execute\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      db.exec(statement + ";");
      console.log(`✓ [${i + 1}/${statements.length}] Executed:`, statement.substring(0, 100));
    } catch (error) {
      // Check if error is because column/index already exists
      const error_message = error instanceof Error ? error.message : String(error);
      if (
        error_message.includes("duplicate column") ||
        error_message.includes("already exists") ||
        error_message.includes("UNIQUE constraint failed") ||
        error_message.includes("index already exists")
      ) {
        console.log(`⚠ [${i + 1}/${statements.length}] Already exists, skipping:`, statement.substring(0, 100));
      } else {
        console.error(`✗ [${i + 1}/${statements.length}] Error:`, error_message);
        throw error;
      }
    }
  }
}

// section: main
function main() {
  const db_path = get_database_path();

  console.log("Applying migration to database:", db_path);

  if (!fs.existsSync(db_path)) {
    console.error("Database file not found:", db_path);
    process.exit(1);
  }

  // Get migration file from command line argument or use default
  const migration_file_arg = process.argv[2];
  const migration_file = migration_file_arg
    ? path.resolve(process.cwd(), migration_file_arg)
    : path.resolve(process.cwd(), "migrations", "002_add_name_to_hazo_users.sql");

  if (!fs.existsSync(migration_file)) {
    console.error("Migration file not found:", migration_file);
    console.error("\nUsage: npx tsx scripts/apply_migration.ts [migration_file_path]");
    process.exit(1);
  }

  const db = new Database(db_path);

  try {
    const migration_sql = fs.readFileSync(migration_file, "utf-8");

    console.log(`\nApplying migration: ${path.basename(migration_file)}`);
    apply_migration_sql(db, migration_sql);

    console.log("\n✓ Migration applied successfully!");
  } catch (error) {
    console.error("Error applying migration:", error);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();

