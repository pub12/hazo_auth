// file_description: CLI command to initialize SQLite database with hazo_auth schema
// Can be run standalone via: npx hazo_auth init-db
import * as fs from "fs";
import * as path from "path";
import { SQLITE_SCHEMA } from "../lib/schema/sqlite_schema.js";
// section: helpers
/**
 * Reads sqlite_path from the config file
 * Simple INI parser - does not use hazo_config to avoid server-only dependency
 */
function read_sqlite_path_from_config(config_path) {
    if (!fs.existsSync(config_path)) {
        return undefined;
    }
    const content = fs.readFileSync(config_path, "utf-8");
    const lines = content.split("\n");
    let in_hazo_connect_section = false;
    for (const line of lines) {
        const trimmed = line.trim();
        // Check for section header
        if (trimmed.startsWith("[")) {
            in_hazo_connect_section = trimmed === "[hazo_connect]";
            continue;
        }
        // Skip comments and empty lines
        if (trimmed.startsWith("#") || trimmed.startsWith(";") || trimmed === "") {
            continue;
        }
        // Parse key=value in the hazo_connect section
        if (in_hazo_connect_section && trimmed.includes("=")) {
            const [key, ...value_parts] = trimmed.split("=");
            const key_trimmed = key.trim();
            const value_trimmed = value_parts.join("=").trim();
            if (key_trimmed === "sqlite_path" && value_trimmed) {
                return value_trimmed;
            }
        }
    }
    return undefined;
}
/**
 * Checks if a SQLite database has the hazo_users table
 */
function has_hazo_users_table(db_path) {
    try {
        // Dynamic import to handle cases where better-sqlite3 isn't installed
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Database = require("better-sqlite3");
        const db = new Database(db_path);
        const row = db
            .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='hazo_users'")
            .get();
        db.close();
        return !!row;
    }
    catch (_a) {
        return false;
    }
}
// section: main
export function handle_init_db() {
    const project_root = process.cwd();
    const config_path = path.join(project_root, "config", "hazo_auth_config.ini");
    console.log("\n\x1b[1m🐸 hazo_auth Database Initialization\x1b[0m");
    console.log("=".repeat(50));
    // Determine sqlite_path
    const config_sqlite_path = read_sqlite_path_from_config(config_path);
    const sqlite_path_raw = config_sqlite_path || process.env.HAZO_CONNECT_SQLITE_PATH || "./data/hazo_auth.sqlite";
    const sqlite_path = path.isAbsolute(sqlite_path_raw)
        ? sqlite_path_raw
        : path.resolve(project_root, sqlite_path_raw);
    console.log(`Database path: ${sqlite_path}\n`);
    // Ensure parent directory exists
    const db_dir = path.dirname(sqlite_path);
    if (!fs.existsSync(db_dir)) {
        fs.mkdirSync(db_dir, { recursive: true });
        console.log(`\x1b[32m[CREATE]\x1b[0m ${path.relative(project_root, db_dir)}/`);
    }
    // Check if DB already has tables
    if (fs.existsSync(sqlite_path) && has_hazo_users_table(sqlite_path)) {
        console.log(`\x1b[33m[EXISTS]\x1b[0m Database already has hazo_users table`);
        console.log("\nTo re-create the schema, delete the database file first.");
        return;
    }
    // Create database and apply schema
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Database = require("better-sqlite3");
        const db = new Database(sqlite_path);
        // Enable WAL mode for better concurrency
        db.pragma("journal_mode = WAL");
        db.pragma("foreign_keys = ON");
        // Execute the full schema
        db.exec(SQLITE_SCHEMA);
        // Verify tables were created
        const tables = db
            .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
            .all();
        db.close();
        const hazo_tables = tables
            .map((t) => t.name)
            .filter((n) => n.startsWith("hazo_"));
        for (const table of hazo_tables) {
            console.log(`\x1b[32m[CREATE]\x1b[0m Table: ${table}`);
        }
        console.log(`\n\x1b[32m✓\x1b[0m Created ${hazo_tables.length} tables in ${path.relative(project_root, sqlite_path)}`);
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("Cannot find module") || msg.includes("better-sqlite3")) {
            console.error("\x1b[31m[ERROR]\x1b[0m better-sqlite3 is required for SQLite database creation.");
            console.error("Install it: npm install better-sqlite3");
        }
        else {
            console.error(`\x1b[31m[ERROR]\x1b[0m Failed to create database: ${msg}`);
        }
        process.exit(1);
    }
}
