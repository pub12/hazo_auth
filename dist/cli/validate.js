// file_description: validation logic for hazo_auth setup verification
// This module contains all the validation checks that can be run via CLI or programmatically
import * as fs from "fs";
import * as path from "path";
// section: constants
const REQUIRED_CONFIG_FILES = [
    "hazo_auth_config.ini",
    "hazo_notify_config.ini",
];
const REQUIRED_ENV_VARS = [
    { name: "JWT_SECRET", required: true, description: "JWT signing secret" },
    { name: "ZEPTOMAIL_API_KEY", required: false, description: "Email API key (required for email)" },
    { name: "HAZO_CONNECT_POSTGREST_API_KEY", required: false, description: "PostgREST API key (if using PostgreSQL)" },
];
const REQUIRED_API_ROUTES = [
    { path: "api/hazo_auth/login", method: "POST" },
    { path: "api/hazo_auth/register", method: "POST" },
    { path: "api/hazo_auth/logout", method: "POST" },
    { path: "api/hazo_auth/me", method: "GET" },
    { path: "api/hazo_auth/forgot_password", method: "POST" },
    { path: "api/hazo_auth/reset_password", method: "POST" },
    { path: "api/hazo_auth/verify_email", method: "GET" },
    { path: "api/hazo_auth/resend_verification", method: "POST" },
    { path: "api/hazo_auth/update_user", method: "PATCH" },
    { path: "api/hazo_auth/change_password", method: "POST" },
    { path: "api/hazo_auth/upload_profile_picture", method: "POST" },
    { path: "api/hazo_auth/remove_profile_picture", method: "DELETE" },
    { path: "api/hazo_auth/library_photos", method: "GET" },
    { path: "api/hazo_auth/get_auth", method: "POST" },
    { path: "api/hazo_auth/validate_reset_token", method: "POST" },
    { path: "api/hazo_auth/profile_picture/[filename]", method: "GET" },
];
// section: helpers
function get_project_root() {
    return process.cwd();
}
function file_exists(filepath) {
    try {
        return fs.existsSync(filepath);
    }
    catch (_a) {
        return false;
    }
}
function read_ini_file(filepath) {
    try {
        const content = fs.readFileSync(filepath, "utf-8");
        const result = {};
        let current_section = "";
        for (const line of content.split("\n")) {
            const trimmed = line.trim();
            if (trimmed.startsWith("#") || trimmed.startsWith(";") || !trimmed) {
                continue;
            }
            const section_match = trimmed.match(/^\[(.+)\]$/);
            if (section_match) {
                current_section = section_match[1];
                result[current_section] = result[current_section] || {};
                continue;
            }
            const kv_match = trimmed.match(/^([^=]+)=(.*)$/);
            if (kv_match && current_section) {
                const key = kv_match[1].trim();
                const value = kv_match[2].trim();
                result[current_section][key] = value;
            }
        }
        return result;
    }
    catch (_a) {
        return null;
    }
}
function print_status(status) {
    switch (status) {
        case "pass":
            return "\x1b[32m[PASS]\x1b[0m";
        case "fail":
            return "\x1b[31m[FAIL]\x1b[0m";
        case "warn":
            return "\x1b[33m[WARN]\x1b[0m";
    }
}
function print_result(result) {
    console.log(`${print_status(result.status)} ${result.name}`);
    if (result.message && (result.status === "fail" || result.status === "warn")) {
        console.log(`       → ${result.message}`);
    }
}
// section: check_functions
function check_config_files(project_root) {
    const results = [];
    for (const config_file of REQUIRED_CONFIG_FILES) {
        const filepath = path.join(project_root, config_file);
        const exists = file_exists(filepath);
        results.push({
            name: `Config file: ${config_file}`,
            status: exists ? "pass" : "fail",
            message: exists ? "" : `File not found. Run: cp node_modules/hazo_auth/${config_file.replace(".ini", ".example.ini")} ./${config_file}`,
        });
    }
    return results;
}
function check_config_values(project_root) {
    var _a, _b, _c, _d, _e, _f;
    const results = [];
    const hazo_config_path = path.join(project_root, "hazo_auth_config.ini");
    const hazo_config = read_ini_file(hazo_config_path);
    if (hazo_config) {
        const db_type = (_a = hazo_config["hazo_connect"]) === null || _a === void 0 ? void 0 : _a["type"];
        if (db_type) {
            results.push({
                name: "Database type configured",
                status: "pass",
                message: `Using: ${db_type}`,
            });
            if (db_type === "sqlite") {
                const sqlite_path = (_b = hazo_config["hazo_connect"]) === null || _b === void 0 ? void 0 : _b["sqlite_path"];
                if (sqlite_path) {
                    results.push({
                        name: "SQLite path configured",
                        status: "pass",
                        message: sqlite_path,
                    });
                }
                else {
                    results.push({
                        name: "SQLite path configured",
                        status: "fail",
                        message: "sqlite_path not set in [hazo_connect] section",
                    });
                }
            }
            else if (db_type === "postgrest") {
                const postgrest_url = (_c = hazo_config["hazo_connect"]) === null || _c === void 0 ? void 0 : _c["postgrest_url"];
                if (postgrest_url) {
                    results.push({
                        name: "PostgREST URL configured",
                        status: "pass",
                        message: postgrest_url,
                    });
                }
                else {
                    results.push({
                        name: "PostgREST URL configured",
                        status: "fail",
                        message: "postgrest_url not set in [hazo_connect] section",
                    });
                }
            }
        }
        else {
            results.push({
                name: "Database type configured",
                status: "fail",
                message: "type not set in [hazo_connect] section",
            });
        }
        const layout_mode = (_d = hazo_config["hazo_auth__ui_shell"]) === null || _d === void 0 ? void 0 : _d["layout_mode"];
        if (layout_mode === "standalone") {
            results.push({
                name: "UI shell mode",
                status: "pass",
                message: "standalone (recommended for consuming projects)",
            });
        }
        else if (layout_mode === "test_sidebar") {
            results.push({
                name: "UI shell mode",
                status: "warn",
                message: "test_sidebar - consider changing to 'standalone' for consuming projects",
            });
        }
        else {
            results.push({
                name: "UI shell mode",
                status: "warn",
                message: "Not set - defaults to test_sidebar. Consider setting to 'standalone'",
            });
        }
    }
    const notify_config_path = path.join(project_root, "hazo_notify_config.ini");
    const notify_config = read_ini_file(notify_config_path);
    if (notify_config) {
        const from_email = (_e = notify_config["emailer"]) === null || _e === void 0 ? void 0 : _e["from_email"];
        const from_name = (_f = notify_config["emailer"]) === null || _f === void 0 ? void 0 : _f["from_name"];
        if (from_email && !from_email.includes("example.com")) {
            results.push({
                name: "Email from_email configured",
                status: "pass",
                message: from_email,
            });
        }
        else {
            results.push({
                name: "Email from_email configured",
                status: "warn",
                message: from_email ? "Using example.com - update to your domain" : "Not set",
            });
        }
        if (from_name && from_name !== "Your App Name") {
            results.push({
                name: "Email from_name configured",
                status: "pass",
                message: from_name,
            });
        }
        else {
            results.push({
                name: "Email from_name configured",
                status: "warn",
                message: "Using default - update to your app name",
            });
        }
    }
    return results;
}
function check_env_vars() {
    const results = [];
    for (const env_var of REQUIRED_ENV_VARS) {
        const value = process.env[env_var.name];
        const has_value = value && value.length > 0;
        if (env_var.required) {
            results.push({
                name: `Environment: ${env_var.name}`,
                status: has_value ? "pass" : "fail",
                message: has_value ? "Set" : `Not set - ${env_var.description}`,
            });
        }
        else {
            results.push({
                name: `Environment: ${env_var.name}`,
                status: has_value ? "pass" : "warn",
                message: has_value ? "Set" : `Not set - ${env_var.description}`,
            });
        }
    }
    return results;
}
function check_api_routes(project_root) {
    const results = [];
    const possible_app_dirs = [
        path.join(project_root, "app"),
        path.join(project_root, "src", "app"),
    ];
    let app_dir = null;
    for (const dir of possible_app_dirs) {
        if (file_exists(dir)) {
            app_dir = dir;
            break;
        }
    }
    if (!app_dir) {
        results.push({
            name: "App directory",
            status: "fail",
            message: "Could not find app/ or src/app/ directory",
        });
        return results;
    }
    results.push({
        name: "App directory",
        status: "pass",
        message: app_dir.replace(project_root, "."),
    });
    let routes_found = 0;
    let routes_missing = 0;
    for (const route of REQUIRED_API_ROUTES) {
        const route_path = path.join(app_dir, route.path, "route.ts");
        const route_path_js = path.join(app_dir, route.path, "route.js");
        const exists = file_exists(route_path) || file_exists(route_path_js);
        if (exists) {
            routes_found++;
        }
        else {
            routes_missing++;
            results.push({
                name: `Route: /${route.path}`,
                status: "fail",
                message: `Missing - create ${route.path}/route.ts with export { ${route.method} } from "hazo_auth/server/routes/..."`,
            });
        }
    }
    if (routes_missing === 0) {
        results.push({
            name: `API Routes (${routes_found}/${REQUIRED_API_ROUTES.length})`,
            status: "pass",
            message: "All routes present",
        });
    }
    else {
        results.unshift({
            name: `API Routes (${routes_found}/${REQUIRED_API_ROUTES.length})`,
            status: "fail",
            message: `${routes_missing} routes missing - run: npx hazo_auth generate-routes`,
        });
    }
    return results;
}
function check_profile_pictures(project_root) {
    const results = [];
    const library_path = path.join(project_root, "public", "profile_pictures", "library");
    const uploads_path = path.join(project_root, "public", "profile_pictures", "uploads");
    if (file_exists(library_path)) {
        try {
            const files = fs.readdirSync(library_path);
            const image_files = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
            if (image_files.length > 0) {
                results.push({
                    name: "Profile picture library",
                    status: "pass",
                    message: `${image_files.length} images available`,
                });
            }
            else {
                results.push({
                    name: "Profile picture library",
                    status: "warn",
                    message: "Directory exists but no images found",
                });
            }
        }
        catch (_a) {
            results.push({
                name: "Profile picture library",
                status: "warn",
                message: "Could not read directory",
            });
        }
    }
    else {
        results.push({
            name: "Profile picture library",
            status: "warn",
            message: "Not found - copy from node_modules/hazo_auth/public/profile_pictures/library/",
        });
    }
    if (file_exists(uploads_path)) {
        results.push({
            name: "Profile picture uploads directory",
            status: "pass",
            message: "Exists",
        });
    }
    else {
        results.push({
            name: "Profile picture uploads directory",
            status: "warn",
            message: "Not found - will be created on first upload",
        });
    }
    return results;
}
function check_database(project_root) {
    var _a, _b, _c;
    const results = [];
    const hazo_config_path = path.join(project_root, "hazo_auth_config.ini");
    const hazo_config = read_ini_file(hazo_config_path);
    if (!hazo_config) {
        results.push({
            name: "Database check",
            status: "fail",
            message: "Could not read hazo_auth_config.ini",
        });
        return results;
    }
    const db_type = (_a = hazo_config["hazo_connect"]) === null || _a === void 0 ? void 0 : _a["type"];
    if (db_type === "sqlite") {
        const sqlite_path = (_b = hazo_config["hazo_connect"]) === null || _b === void 0 ? void 0 : _b["sqlite_path"];
        if (sqlite_path) {
            const full_path = path.isAbsolute(sqlite_path)
                ? sqlite_path
                : path.join(project_root, sqlite_path);
            if (file_exists(full_path)) {
                results.push({
                    name: "SQLite database file",
                    status: "pass",
                    message: full_path.replace(project_root, "."),
                });
                try {
                    const stats = fs.statSync(full_path);
                    if (stats.size > 0) {
                        results.push({
                            name: "SQLite database readable",
                            status: "pass",
                            message: `File size: ${(stats.size / 1024).toFixed(2)} KB`,
                        });
                    }
                    else {
                        results.push({
                            name: "SQLite database readable",
                            status: "warn",
                            message: "Database file is empty - tables may need to be created",
                        });
                    }
                }
                catch (_d) {
                    results.push({
                        name: "SQLite database readable",
                        status: "fail",
                        message: "Could not read database file",
                    });
                }
            }
            else {
                const parent_dir = path.dirname(full_path);
                if (file_exists(parent_dir)) {
                    results.push({
                        name: "SQLite database file",
                        status: "warn",
                        message: "File not found - will be created on first use",
                    });
                }
                else {
                    results.push({
                        name: "SQLite database file",
                        status: "fail",
                        message: `Parent directory not found: ${parent_dir}. Create it with: mkdir -p ${parent_dir}`,
                    });
                }
            }
        }
    }
    else if (db_type === "postgrest") {
        const postgrest_url = (_c = hazo_config["hazo_connect"]) === null || _c === void 0 ? void 0 : _c["postgrest_url"];
        if (postgrest_url) {
            results.push({
                name: "PostgREST connection",
                status: "pass",
                message: `URL configured: ${postgrest_url}`,
            });
            results.push({
                name: "PostgREST tables",
                status: "warn",
                message: "Cannot verify tables remotely - ensure all hazo_* tables exist in PostgreSQL",
            });
        }
        else {
            results.push({
                name: "PostgREST connection",
                status: "fail",
                message: "postgrest_url not configured",
            });
        }
    }
    return results;
}
// section: main
export function run_validation() {
    const project_root = get_project_root();
    const all_results = [];
    console.log("\n\x1b[1m🐸 hazo_auth Setup Validation\x1b[0m");
    console.log("=".repeat(50));
    console.log(`Project root: ${project_root}\n`);
    console.log("\x1b[1m📁 Configuration Files\x1b[0m");
    const config_results = check_config_files(project_root);
    config_results.forEach(print_result);
    all_results.push(...config_results);
    console.log();
    console.log("\x1b[1m⚙️  Configuration Values\x1b[0m");
    const value_results = check_config_values(project_root);
    value_results.forEach(print_result);
    all_results.push(...value_results);
    console.log();
    console.log("\x1b[1m🔐 Environment Variables\x1b[0m");
    const env_results = check_env_vars();
    env_results.forEach(print_result);
    all_results.push(...env_results);
    console.log();
    console.log("\x1b[1m🗄️  Database\x1b[0m");
    const db_results = check_database(project_root);
    db_results.forEach(print_result);
    all_results.push(...db_results);
    console.log();
    console.log("\x1b[1m🛤️  API Routes\x1b[0m");
    const route_results = check_api_routes(project_root);
    route_results.forEach(print_result);
    all_results.push(...route_results);
    console.log();
    console.log("\x1b[1m🖼️  Profile Pictures\x1b[0m");
    const pic_results = check_profile_pictures(project_root);
    pic_results.forEach(print_result);
    all_results.push(...pic_results);
    console.log();
    const summary = {
        passed: all_results.filter(r => r.status === "pass").length,
        failed: all_results.filter(r => r.status === "fail").length,
        warnings: all_results.filter(r => r.status === "warn").length,
        results: all_results,
    };
    console.log("=".repeat(50));
    console.log("\x1b[1mSummary:\x1b[0m");
    console.log(`  \x1b[32m✓ Passed:   ${summary.passed}\x1b[0m`);
    console.log(`  \x1b[31m✗ Failed:   ${summary.failed}\x1b[0m`);
    console.log(`  \x1b[33m⚠ Warnings: ${summary.warnings}\x1b[0m`);
    console.log();
    if (summary.failed === 0 && summary.warnings === 0) {
        console.log("\x1b[32m🦊 All checks passed! hazo_auth is ready to use.\x1b[0m\n");
    }
    else if (summary.failed === 0) {
        console.log("\x1b[33m🦊 Setup complete with warnings. Review the warnings above.\x1b[0m\n");
    }
    else {
        console.log("\x1b[31m🦊 Setup incomplete. Please fix the failed checks above.\x1b[0m\n");
        console.log("For detailed setup instructions, see:");
        console.log("  https://github.com/your-repo/hazo_auth/blob/main/SETUP_CHECKLIST.md\n");
    }
    return summary;
}
