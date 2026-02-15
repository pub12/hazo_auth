// file_description: init command for hazo_auth
// Creates directories and copies config files to consuming projects

import { fileURLToPath } from "url";
import * as fs from "fs";
import * as path from "path";

// section: esm_shim
// ESM-compatible __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// section: types
type InitResult = {
  directories_created: string[];
  files_copied: string[];
  skipped: string[];
  errors: string[];
};

// section: constants
const REQUIRED_DIRECTORIES = [
  "public/profile_pictures/library",
  "public/profile_pictures/uploads",
  "data",
  "config",
];

const CONFIG_FILES = [
  { source: "config/hazo_auth_config.example.ini", target: "config/hazo_auth_config.ini" },
  { source: "config/hazo_notify_config.example.ini", target: "config/hazo_notify_config.ini" },
];

// section: helpers
function get_project_root(): string {
  return process.cwd();
}

function get_package_root(): string {
  // When running from node_modules, we need to find the hazo_auth package root
  // When running in development, use the current directory
  
  // Check if we're in node_modules
  const parts = __dirname.split(path.sep);
  const node_modules_index = parts.lastIndexOf("node_modules");
  
  if (node_modules_index !== -1) {
    // We're in node_modules/hazo_auth/dist/cli
    return parts.slice(0, node_modules_index + 2).join(path.sep);
  }
  
  // Development mode - go up from src/cli or dist/cli
  return path.resolve(__dirname, "..", "..");
}

function ensure_dir(dir_path: string): boolean {
  if (!fs.existsSync(dir_path)) {
    fs.mkdirSync(dir_path, { recursive: true });
    return true;
  }
  return false;
}

function copy_file_if_not_exists(source: string, target: string): "created" | "skipped" | "error" {
  if (fs.existsSync(target)) {
    return "skipped";
  }
  
  if (!fs.existsSync(source)) {
    return "error";
  }
  
  try {
    fs.copyFileSync(source, target);
    return "created";
  } catch {
    return "error";
  }
}

function copy_directory(source: string, target: string): number {
  let copied = 0;
  
  if (!fs.existsSync(source)) {
    return 0;
  }
  
  ensure_dir(target);
  
  const items = fs.readdirSync(source);
  
  for (const item of items) {
    const source_path = path.join(source, item);
    const target_path = path.join(target, item);
    
    const stat = fs.statSync(source_path);
    
    if (stat.isDirectory()) {
      copied += copy_directory(source_path, target_path);
    } else if (!fs.existsSync(target_path)) {
      fs.copyFileSync(source_path, target_path);
      copied++;
    }
  }
  
  return copied;
}

function create_gitkeep(dir_path: string): void {
  const gitkeep_path = path.join(dir_path, ".gitkeep");
  if (!fs.existsSync(gitkeep_path)) {
    const files = fs.readdirSync(dir_path);
    if (files.length === 0) {
      fs.writeFileSync(gitkeep_path, "# This file keeps the empty directory in git\n");
    }
  }
}

function create_env_template(project_root: string): boolean {
  const env_example_path = path.join(project_root, ".env.local.example");
  
  if (fs.existsSync(env_example_path)) {
    return false;
  }
  
  const content = `# hazo_auth environment variables
# Copy this file to .env.local and fill in the values

# Required: Cookie prefix (MUST match cookie_prefix in hazo_auth_config.ini)
# Each app using hazo_auth needs a unique prefix to prevent cookie conflicts
HAZO_AUTH_COOKIE_PREFIX=myapp_

# Required for email functionality (email verification, password reset)
ZEPTOMAIL_API_KEY=your_zeptomail_api_key_here

# Required for JWT authentication (min 32 chars)
# Generate with: openssl rand -base64 32
JWT_SECRET=your_secure_random_string_at_least_32_characters

# Optional: Database path (defaults to data/hazo_auth.sqlite)
# HAZO_AUTH_DB_PATH=./data/hazo_auth.sqlite
`;
  
  fs.writeFileSync(env_example_path, content);
  return true;
}

// section: main
export async function handle_init(): Promise<void> {
  const project_root = get_project_root();
  const package_root = get_package_root();
  
  console.log("\n\x1b[1m🐸 hazo_auth Initialization\x1b[0m");
  console.log("=".repeat(50));
  console.log(`Project root: ${project_root}`);
  console.log(`Package root: ${package_root}\n`);
  
  const result: InitResult = {
    directories_created: [],
    files_copied: [],
    skipped: [],
    errors: [],
  };
  
  // Step 1: Create directories
  console.log("\x1b[1m📁 Creating directories...\x1b[0m\n");
  
  for (const dir of REQUIRED_DIRECTORIES) {
    const full_path = path.join(project_root, dir);
    
    if (ensure_dir(full_path)) {
      console.log(`\x1b[32m[CREATE]\x1b[0m ${dir}/`);
      result.directories_created.push(dir);
    } else {
      console.log(`\x1b[33m[EXISTS]\x1b[0m ${dir}/`);
      result.skipped.push(dir);
    }
  }
  
  // Step 2: Copy config files
  console.log("\n\x1b[1m📄 Copying config files...\x1b[0m\n");
  
  for (const config of CONFIG_FILES) {
    const source_path = path.join(package_root, config.source);
    const target_path = path.join(project_root, config.target);
    
    const status = copy_file_if_not_exists(source_path, target_path);
    
    if (status === "created") {
      console.log(`\x1b[32m[CREATE]\x1b[0m ${config.target}`);
      result.files_copied.push(config.target);
    } else if (status === "skipped") {
      console.log(`\x1b[33m[EXISTS]\x1b[0m ${config.target}`);
      result.skipped.push(config.target);
    } else {
      console.log(`\x1b[31m[ERROR]\x1b[0m ${config.target} - source not found: ${source_path}`);
      result.errors.push(config.target);
    }
  }
  
  // Step 3: Copy profile picture library
  console.log("\n\x1b[1m🖼️  Copying profile picture library...\x1b[0m\n");
  
  const library_source = path.join(package_root, "public", "profile_pictures", "library");
  const library_target = path.join(project_root, "public", "profile_pictures", "library");
  
  if (fs.existsSync(library_source)) {
    const copied_count = copy_directory(library_source, library_target);
    
    if (copied_count > 0) {
      console.log(`\x1b[32m[COPY]\x1b[0m ${copied_count} library images`);
      result.files_copied.push(`${copied_count} library images`);
    } else {
      console.log(`\x1b[33m[EXISTS]\x1b[0m Library images already present`);
      result.skipped.push("library images");
    }
  } else {
    console.log(`\x1b[33m[SKIP]\x1b[0m Library not found at: ${library_source}`);
    result.skipped.push("library images (source not found)");
  }
  
  // Step 4: Copy default auth page images
  console.log("\n\x1b[1m🖼️  Copying auth page images...\x1b[0m\n");

  const images_source = path.join(package_root, "public", "hazo_auth", "images");
  const images_target = path.join(project_root, "public", "hazo_auth", "images");

  // Also check cli-src assets (when running from package via npx)
  const cli_images_source = path.join(package_root, "cli-src", "assets", "images");
  const actual_images_source = fs.existsSync(images_source) ? images_source : cli_images_source;

  if (fs.existsSync(actual_images_source)) {
    const copied_count = copy_directory(actual_images_source, images_target);

    if (copied_count > 0) {
      console.log(`\x1b[32m[COPY]\x1b[0m ${copied_count} auth page images to public/hazo_auth/images/`);
      result.files_copied.push(`${copied_count} auth page images`);
    } else {
      console.log(`\x1b[33m[EXISTS]\x1b[0m Auth page images already present`);
      result.skipped.push("auth page images");
    }
  } else {
    console.log(`\x1b[33m[SKIP]\x1b[0m Auth images not found at: ${actual_images_source}`);
    result.skipped.push("auth page images (source not found)");
  }

  // Step 5: Create .gitkeep files for empty directories
  console.log("\n\x1b[1m📌 Creating .gitkeep files...\x1b[0m\n");
  
  const empty_dirs = ["public/profile_pictures/uploads", "data"];
  
  for (const dir of empty_dirs) {
    const full_path = path.join(project_root, dir);
    if (fs.existsSync(full_path)) {
      create_gitkeep(full_path);
      console.log(`\x1b[32m[CREATE]\x1b[0m ${dir}/.gitkeep`);
    }
  }
  
  // Step 6: Create .env.local.example template
  console.log("\n\x1b[1m🔑 Creating environment template...\x1b[0m\n");
  
  if (create_env_template(project_root)) {
    console.log(`\x1b[32m[CREATE]\x1b[0m .env.local.example`);
    result.files_copied.push(".env.local.example");
  } else {
    console.log(`\x1b[33m[EXISTS]\x1b[0m .env.local.example`);
    result.skipped.push(".env.local.example");
  }
  
  // Step 7: Create SQLite database with schema
  console.log("\n\x1b[1m🗄️  Creating SQLite database...\x1b[0m\n");

  try {
    // Read sqlite_path from the config file that was just copied
    const config_file = path.join(project_root, "config", "hazo_auth_config.ini");
    let sqlite_path_raw = "./data/hazo_auth.sqlite";

    if (fs.existsSync(config_file)) {
      const content = fs.readFileSync(config_file, "utf-8");
      const match = content.match(/^\s*sqlite_path\s*=\s*(.+)$/m);
      if (match) {
        sqlite_path_raw = match[1].trim();
      }
    }

    const sqlite_path = path.isAbsolute(sqlite_path_raw)
      ? sqlite_path_raw
      : path.resolve(project_root, sqlite_path_raw);

    // Ensure parent directory exists
    const db_dir = path.dirname(sqlite_path);
    if (!fs.existsSync(db_dir)) {
      fs.mkdirSync(db_dir, { recursive: true });
    }

    // Check if DB already has tables
    let needs_schema = true;
    if (fs.existsSync(sqlite_path)) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Database = require("better-sqlite3");
        const db = new Database(sqlite_path);
        const row = db
          .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='hazo_users'")
          .get();
        db.close();
        if (row) {
          needs_schema = false;
          console.log(`\x1b[33m[EXISTS]\x1b[0m Database already has hazo_users table`);
          result.skipped.push("SQLite database");
        }
      } catch {
        // If we can't open/check, assume we need to create
      }
    }

    if (needs_schema) {
      const { SQLITE_SCHEMA } = await import("../lib/schema/sqlite_schema.js");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Database = require("better-sqlite3");
      const db = new Database(sqlite_path);
      db.pragma("journal_mode = WAL");
      db.pragma("foreign_keys = ON");
      db.exec(SQLITE_SCHEMA);

      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        .all() as { name: string }[];
      db.close();

      const hazo_tables = tables.map((t: { name: string }) => t.name).filter((n: string) => n.startsWith("hazo_"));
      for (const table of hazo_tables) {
        console.log(`\x1b[32m[CREATE]\x1b[0m Table: ${table}`);
      }
      result.files_copied.push(`SQLite database (${hazo_tables.length} tables)`);
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("Cannot find module") || msg.includes("better-sqlite3")) {
      console.log(`\x1b[33m[SKIP]\x1b[0m better-sqlite3 not found - run \x1b[36mnpx hazo_auth init-db\x1b[0m after installing it`);
    } else {
      console.log(`\x1b[31m[ERROR]\x1b[0m Database creation failed: ${msg}`);
      result.errors.push("SQLite database");
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("\x1b[1mSummary:\x1b[0m");
  console.log(`  \x1b[32m✓ Created:\x1b[0m ${result.directories_created.length} directories, ${result.files_copied.length} files`);
  console.log(`  \x1b[33m⊘ Skipped:\x1b[0m ${result.skipped.length} items`);
  
  if (result.errors.length > 0) {
    console.log(`  \x1b[31m✗ Errors:\x1b[0m ${result.errors.length}`);
  }
  
  console.log("\n\x1b[32m🦊 Initialization complete!\x1b[0m");
  console.log("\nNext steps:");
  console.log("  1. Edit \x1b[36mconfig/hazo_auth_config.ini\x1b[0m — set \x1b[1mcookie_prefix\x1b[0m in [hazo_auth__cookies] (REQUIRED)");
  console.log("  2. Copy \x1b[36m.env.local.example\x1b[0m to \x1b[36m.env.local\x1b[0m and set \x1b[1mHAZO_AUTH_COOKIE_PREFIX\x1b[0m to match");
  console.log("  3. Add \x1b[1mJWT_SECRET\x1b[0m and \x1b[1mZEPTOMAIL_API_KEY\x1b[0m to \x1b[36m.env.local\x1b[0m");
  console.log("  4. Run \x1b[36mnpx hazo_auth init-users\x1b[0m to create default roles/permissions");
  console.log("  5. Run \x1b[36mnpx hazo_auth generate-routes --pages\x1b[0m to generate routes and pages");
  console.log("  6. Run \x1b[36mnpx hazo_auth validate\x1b[0m to check your setup");
  console.log();
}
