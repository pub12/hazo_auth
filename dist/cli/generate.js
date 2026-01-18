// file_description: route and page generation logic for hazo_auth
// This module creates API route files and page files in consuming projects
import * as fs from "fs";
import * as path from "path";
// section: constants
const ROUTES = [
    { name: "login", path: "api/hazo_auth/login", method: "POST", export_name: "loginPOST" },
    { name: "register", path: "api/hazo_auth/register", method: "POST", export_name: "registerPOST" },
    { name: "logout", path: "api/hazo_auth/logout", method: "POST", export_name: "logoutPOST" },
    { name: "me", path: "api/hazo_auth/me", method: "GET", export_name: "meGET" },
    { name: "forgot_password", path: "api/hazo_auth/forgot_password", method: "POST", export_name: "forgotPasswordPOST" },
    { name: "reset_password", path: "api/hazo_auth/reset_password", method: "POST", export_name: "resetPasswordPOST" },
    { name: "verify_email", path: "api/hazo_auth/verify_email", method: "GET", export_name: "verifyEmailGET" },
    { name: "resend_verification", path: "api/hazo_auth/resend_verification", method: "POST", export_name: "resendVerificationPOST" },
    { name: "update_user", path: "api/hazo_auth/update_user", method: "PATCH", export_name: "updateUserPATCH" },
    { name: "change_password", path: "api/hazo_auth/change_password", method: "POST", export_name: "changePasswordPOST" },
    { name: "upload_profile_picture", path: "api/hazo_auth/upload_profile_picture", method: "POST", export_name: "uploadProfilePicturePOST" },
    { name: "remove_profile_picture", path: "api/hazo_auth/remove_profile_picture", method: "DELETE", export_name: "removeProfilePictureDELETE" },
    { name: "library_photos", path: "api/hazo_auth/library_photos", method: "GET", export_name: "libraryPhotosGET" },
    { name: "library_photo", path: "api/hazo_auth/library_photo/[category]/[filename]", method: "GET", export_name: "libraryPhotoGET" },
    { name: "get_auth", path: "api/hazo_auth/get_auth", method: "POST", export_name: "getAuthPOST" },
    { name: "validate_reset_token", path: "api/hazo_auth/validate_reset_token", method: "GET", export_name: "validateResetTokenGET" },
    { name: "profile_picture_filename", path: "api/hazo_auth/profile_picture/[filename]", method: "GET", export_name: "profilePictureFilenameGET" },
    { name: "invalidate_cache", path: "api/hazo_auth/invalidate_cache", method: "POST", export_name: "invalidateCachePOST" },
    // User management routes
    { name: "user_management_users", path: "api/hazo_auth/user_management/users", method: "GET", export_name: "userManagementUsersGET" },
    { name: "user_management_users_patch", path: "api/hazo_auth/user_management/users", method: "PATCH", export_name: "userManagementUsersPATCH" },
    { name: "user_management_users_post", path: "api/hazo_auth/user_management/users", method: "POST", export_name: "userManagementUsersPOST" },
    { name: "user_management_permissions", path: "api/hazo_auth/user_management/permissions", method: "GET", export_name: "userManagementPermissionsGET" },
    { name: "user_management_permissions_post", path: "api/hazo_auth/user_management/permissions", method: "POST", export_name: "userManagementPermissionsPOST" },
    { name: "user_management_permissions_put", path: "api/hazo_auth/user_management/permissions", method: "PUT", export_name: "userManagementPermissionsPUT" },
    { name: "user_management_permissions_delete", path: "api/hazo_auth/user_management/permissions", method: "DELETE", export_name: "userManagementPermissionsDELETE" },
    { name: "user_management_roles", path: "api/hazo_auth/user_management/roles", method: "GET", export_name: "userManagementRolesGET" },
    { name: "user_management_roles_post", path: "api/hazo_auth/user_management/roles", method: "POST", export_name: "userManagementRolesPOST" },
    { name: "user_management_roles_put", path: "api/hazo_auth/user_management/roles", method: "PUT", export_name: "userManagementRolesPUT" },
    { name: "user_management_users_roles", path: "api/hazo_auth/user_management/users/roles", method: "GET", export_name: "userManagementUsersRolesGET" },
    { name: "user_management_users_roles_post", path: "api/hazo_auth/user_management/users/roles", method: "POST", export_name: "userManagementUsersRolesPOST" },
    { name: "user_management_users_roles_put", path: "api/hazo_auth/user_management/users/roles", method: "PUT", export_name: "userManagementUsersRolesPUT" },
    // OAuth routes
    { name: "nextauth", path: "api/auth/[...nextauth]", method: "GET", export_name: "nextauthGET" },
    { name: "nextauth_post", path: "api/auth/[...nextauth]", method: "POST", export_name: "nextauthPOST" },
    { name: "oauth_google_callback", path: "api/hazo_auth/oauth/google/callback", method: "GET", export_name: "oauthGoogleCallbackGET" },
    { name: "set_password", path: "api/hazo_auth/set_password", method: "POST", export_name: "setPasswordPOST" },
];
const PAGES = [
    { name: "login", path: "hazo_auth/login", component_name: "LoginPage", import_path: "hazo_auth/pages/login" },
    { name: "register", path: "hazo_auth/register", component_name: "RegisterPage", import_path: "hazo_auth/pages/register" },
    { name: "forgot_password", path: "hazo_auth/forgot_password", component_name: "ForgotPasswordPage", import_path: "hazo_auth/pages/forgot_password" },
    { name: "reset_password", path: "hazo_auth/reset_password", component_name: "ResetPasswordPage", import_path: "hazo_auth/pages/reset_password" },
    { name: "verify_email", path: "hazo_auth/verify_email", component_name: "VerifyEmailPage", import_path: "hazo_auth/pages/verify_email" },
    { name: "my_settings", path: "hazo_auth/my_settings", component_name: "MySettingsPage", import_path: "hazo_auth/pages/my_settings" },
];
// Note: Using barrel export "hazo_auth/pages" which maps to dist/server_pages/index.js in package.json exports
// section: helpers
function get_project_root() {
    return process.cwd();
}
function find_app_dir(project_root) {
    const possible_dirs = [
        path.join(project_root, "app"),
        path.join(project_root, "src", "app"),
    ];
    for (const dir of possible_dirs) {
        if (fs.existsSync(dir)) {
            return dir;
        }
    }
    return null;
}
function ensure_dir(dir_path) {
    if (!fs.existsSync(dir_path)) {
        fs.mkdirSync(dir_path, { recursive: true });
    }
}
function file_exists(filepath) {
    return fs.existsSync(filepath);
}
function generate_route_content(route) {
    return `// Generated by hazo_auth - do not edit manually
// Route: /${route.path}
// Method: ${route.method}
export { ${route.export_name} as ${route.method} } from "hazo_auth/server/routes";
`;
}
function generate_route_content_multi(routes) {
    const path = routes[0].path;
    const exports = routes.map(r => `export { ${r.export_name} as ${r.method} } from "hazo_auth/server/routes";`).join("\n");
    const methods = routes.map(r => r.method).join(", ");
    return `// Generated by hazo_auth - do not edit manually
// Route: /${path}
// Methods: ${methods}
${exports}
`;
}
function generate_page_content(page) {
    return `// Generated by hazo_auth - do not edit manually
// Page: /${page.path}
import { ${page.component_name} } from "hazo_auth/pages";

export default ${page.component_name};
`;
}
// section: api_route_generation
function generate_api_routes(app_dir, project_root) {
    let created = 0;
    let skipped = 0;
    let errors = 0;
    console.log("\x1b[1m📡 Generating API routes...\x1b[0m\n");
    // Group routes by path to handle multiple methods per path
    const routes_by_path = new Map();
    for (const route of ROUTES) {
        const existing = routes_by_path.get(route.path) || [];
        existing.push(route);
        routes_by_path.set(route.path, existing);
    }
    for (const [route_path, routes_for_path] of routes_by_path) {
        const route_dir = path.join(app_dir, route_path);
        const route_file = path.join(route_dir, "route.ts");
        if (file_exists(route_file)) {
            console.log(`\x1b[33m[SKIP]\x1b[0m ${route_path}/route.ts (already exists)`);
            skipped++;
            continue;
        }
        try {
            ensure_dir(route_dir);
            // Generate content with all methods for this path
            const content = generate_route_content_multi(routes_for_path);
            fs.writeFileSync(route_file, content, "utf-8");
            const methods = routes_for_path.map(r => r.method).join(", ");
            console.log(`\x1b[32m[CREATE]\x1b[0m ${route_path}/route.ts (${methods})`);
            created++;
        }
        catch (err) {
            console.log(`\x1b[31m[ERROR]\x1b[0m ${route_path}/route.ts - ${err instanceof Error ? err.message : "Unknown error"}`);
            errors++;
        }
    }
    return { created, skipped, errors };
}
// section: page_generation
function generate_page_routes(app_dir, project_root) {
    let created = 0;
    let skipped = 0;
    let errors = 0;
    console.log("\n\x1b[1m📄 Generating page routes...\x1b[0m\n");
    for (const page of PAGES) {
        const page_dir = path.join(app_dir, page.path);
        const page_file = path.join(page_dir, "page.tsx");
        if (file_exists(page_file)) {
            console.log(`\x1b[33m[SKIP]\x1b[0m ${page.path}/page.tsx (already exists)`);
            skipped++;
            continue;
        }
        try {
            ensure_dir(page_dir);
            const content = generate_page_content(page);
            fs.writeFileSync(page_file, content, "utf-8");
            console.log(`\x1b[32m[CREATE]\x1b[0m ${page.path}/page.tsx`);
            created++;
        }
        catch (err) {
            console.log(`\x1b[31m[ERROR]\x1b[0m ${page.path}/page.tsx - ${err instanceof Error ? err.message : "Unknown error"}`);
            errors++;
        }
    }
    return { created, skipped, errors };
}
// section: main
export function generate_routes(options = {}) {
    const { dir, pages = false, all = false } = options;
    const project_root = get_project_root();
    const include_pages = pages || all;
    console.log("\n\x1b[1m🐸 hazo_auth Route Generator\x1b[0m");
    console.log("=".repeat(50));
    console.log(`Project root: ${project_root}`);
    console.log(`Mode: ${include_pages ? "API routes + Pages" : "API routes only"}\n`);
    const app_dir = dir
        ? path.join(project_root, dir)
        : find_app_dir(project_root);
    if (!app_dir) {
        console.error("\x1b[31mError: Could not find app directory.\x1b[0m");
        console.log("Try specifying it with: npx hazo_auth generate-routes --dir=src/app");
        process.exit(1);
    }
    if (!fs.existsSync(app_dir)) {
        console.error(`\x1b[31mError: App directory not found: ${app_dir}\x1b[0m`);
        process.exit(1);
    }
    console.log(`App directory: ${app_dir.replace(project_root, ".")}\n`);
    // Generate API routes
    const api_result = generate_api_routes(app_dir, project_root);
    // Generate pages if requested
    let page_result = { created: 0, skipped: 0, errors: 0 };
    if (include_pages) {
        page_result = generate_page_routes(app_dir, project_root);
    }
    // Summary
    const total_created = api_result.created + page_result.created;
    const total_skipped = api_result.skipped + page_result.skipped;
    const total_errors = api_result.errors + page_result.errors;
    console.log("\n" + "=".repeat(50));
    console.log("\x1b[1mSummary:\x1b[0m");
    console.log(`  \x1b[32m✓ Created: ${total_created}\x1b[0m (${api_result.created} routes, ${page_result.created} pages)`);
    console.log(`  \x1b[33m⊘ Skipped: ${total_skipped}\x1b[0m`);
    if (total_errors > 0) {
        console.log(`  \x1b[31m✗ Errors:  ${total_errors}\x1b[0m`);
    }
    console.log();
    if (total_created > 0) {
        console.log("\x1b[32m🦊 Generation complete!\x1b[0m");
        console.log("\nNext steps:");
        console.log("  1. Run `npm run dev` to start your development server");
        console.log("  2. Test API: `curl http://localhost:3000/api/hazo_auth/me`");
        if (include_pages) {
            console.log("  3. Visit http://localhost:3000/hazo_auth/login to test pages");
        }
        console.log();
    }
    else if (total_skipped === ROUTES.length + (include_pages ? PAGES.length : 0)) {
        console.log("\x1b[33m🦊 All files already exist. No changes made.\x1b[0m\n");
    }
}
