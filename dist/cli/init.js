// file_description: init command for hazo_auth
// Creates directories and copies config files to consuming projects
import { fileURLToPath } from "url";
import * as fs from "fs";
import * as path from "path";
// section: esm_shim
// ESM-compatible __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// section: constants
const REQUIRED_DIRECTORIES = [
    "public/profile_pictures/library",
    "public/profile_pictures/uploads",
    "data",
];
const CONFIG_FILES = [
    { source: "hazo_auth_config.example.ini", target: "hazo_auth_config.ini" },
    { source: "hazo_notify_config.example.ini", target: "hazo_notify_config.ini" },
];
// section: helpers
function get_project_root() {
    return process.cwd();
}
function get_package_root() {
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
function ensure_dir(dir_path) {
    if (!fs.existsSync(dir_path)) {
        fs.mkdirSync(dir_path, { recursive: true });
        return true;
    }
    return false;
}
function copy_file_if_not_exists(source, target) {
    if (fs.existsSync(target)) {
        return "skipped";
    }
    if (!fs.existsSync(source)) {
        return "error";
    }
    try {
        fs.copyFileSync(source, target);
        return "created";
    }
    catch (_a) {
        return "error";
    }
}
function copy_directory(source, target) {
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
        }
        else if (!fs.existsSync(target_path)) {
            fs.copyFileSync(source_path, target_path);
            copied++;
        }
    }
    return copied;
}
function create_gitkeep(dir_path) {
    const gitkeep_path = path.join(dir_path, ".gitkeep");
    if (!fs.existsSync(gitkeep_path)) {
        const files = fs.readdirSync(dir_path);
        if (files.length === 0) {
            fs.writeFileSync(gitkeep_path, "# This file keeps the empty directory in git\n");
        }
    }
}
function create_env_template(project_root) {
    const env_example_path = path.join(project_root, ".env.local.example");
    if (fs.existsSync(env_example_path)) {
        return false;
    }
    const content = `# hazo_auth environment variables
# Copy this file to .env.local and fill in the values

# Required for email functionality (email verification, password reset)
ZEPTOMAIL_API_KEY=your_zeptomail_api_key_here

# Optional: Database path (defaults to data/hazo_auth.sqlite)
# HAZO_AUTH_DB_PATH=./data/hazo_auth.sqlite
`;
    fs.writeFileSync(env_example_path, content);
    return true;
}
// section: main
export function handle_init() {
    const project_root = get_project_root();
    const package_root = get_package_root();
    console.log("\n\x1b[1m🐸 hazo_auth Initialization\x1b[0m");
    console.log("=".repeat(50));
    console.log(`Project root: ${project_root}`);
    console.log(`Package root: ${package_root}\n`);
    const result = {
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
        }
        else {
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
        }
        else if (status === "skipped") {
            console.log(`\x1b[33m[EXISTS]\x1b[0m ${config.target}`);
            result.skipped.push(config.target);
        }
        else {
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
        }
        else {
            console.log(`\x1b[33m[EXISTS]\x1b[0m Library images already present`);
            result.skipped.push("library images");
        }
    }
    else {
        console.log(`\x1b[33m[SKIP]\x1b[0m Library not found at: ${library_source}`);
        result.skipped.push("library images (source not found)");
    }
    // Step 4: Create .gitkeep files for empty directories
    console.log("\n\x1b[1m📌 Creating .gitkeep files...\x1b[0m\n");
    const empty_dirs = ["public/profile_pictures/uploads", "data"];
    for (const dir of empty_dirs) {
        const full_path = path.join(project_root, dir);
        if (fs.existsSync(full_path)) {
            create_gitkeep(full_path);
            console.log(`\x1b[32m[CREATE]\x1b[0m ${dir}/.gitkeep`);
        }
    }
    // Step 5: Create .env.local.example template
    console.log("\n\x1b[1m🔑 Creating environment template...\x1b[0m\n");
    if (create_env_template(project_root)) {
        console.log(`\x1b[32m[CREATE]\x1b[0m .env.local.example`);
        result.files_copied.push(".env.local.example");
    }
    else {
        console.log(`\x1b[33m[EXISTS]\x1b[0m .env.local.example`);
        result.skipped.push(".env.local.example");
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
    console.log("  1. Edit \x1b[36mhazo_auth_config.ini\x1b[0m with your settings");
    console.log("  2. Copy \x1b[36m.env.local.example\x1b[0m to \x1b[36m.env.local\x1b[0m and add your API keys");
    console.log("  3. Run \x1b[36mnpx hazo_auth generate-routes --pages\x1b[0m to generate routes and pages");
    console.log("  4. Run \x1b[36mnpx hazo_auth validate\x1b[0m to check your setup");
    console.log();
}
