// file_description: health check API endpoint for hazo_auth setup verification
// This endpoint is only available in development mode (NODE_ENV !== 'production')
// section: imports
import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

// section: types
type CheckStatus = "ok" | "warning" | "error";

type HealthCheckResponse = {
  status: "ok" | "partial" | "error";
  environment: string;
  timestamp: string;
  checks: {
    config: { status: CheckStatus; message: string };
    database: { status: CheckStatus; message: string };
    email: { status: CheckStatus; message: string };
    routes: Record<string, "ok" | "missing">;
    profile_pictures: { status: CheckStatus; message: string };
  };
  recommendations: string[];
};

// section: constants
const REQUIRED_ROUTES = [
  "login",
  "register",
  "logout",
  "me",
  "forgot_password",
  "reset_password",
  "verify_email",
  "resend_verification",
  "update_user",
  "change_password",
  "upload_profile_picture",
  "remove_profile_picture",
  "library_photos",
  "get_auth",
  "validate_reset_token",
];

// section: helpers
function file_exists(filepath: string): boolean {
  try {
    return fs.existsSync(filepath);
  } catch {
    return false;
  }
}

function read_ini_file(filepath: string): Record<string, Record<string, string>> | null {
  try {
    const content = fs.readFileSync(filepath, "utf-8");
    const result: Record<string, Record<string, string>> = {};
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
  } catch {
    return null;
  }
}

function check_config(): { status: CheckStatus; message: string } {
  const project_root = process.cwd();
  const hazo_config_path = path.join(project_root, "config", "hazo_auth_config.ini");
  const notify_config_path = path.join(project_root, "config", "hazo_notify_config.ini");

  const hazo_exists = file_exists(hazo_config_path);
  const notify_exists = file_exists(notify_config_path);

  if (hazo_exists && notify_exists) {
    return { status: "ok", message: "Both config files found" };
  } else if (hazo_exists || notify_exists) {
    const missing = !hazo_exists ? "config/hazo_auth_config.ini" : "config/hazo_notify_config.ini";
    return { status: "warning", message: `Missing: ${missing}` };
  } else {
    return { status: "error", message: "Config files not found" };
  }
}

function check_database(): { status: CheckStatus; message: string } {
  const project_root = process.cwd();
  const hazo_config_path = path.join(project_root, "config", "hazo_auth_config.ini");
  const hazo_config = read_ini_file(hazo_config_path);

  if (!hazo_config) {
    return { status: "error", message: "Cannot read config file" };
  }

  const db_type = hazo_config["hazo_connect"]?.["type"];

  if (!db_type) {
    return { status: "error", message: "Database type not configured" };
  }

  if (db_type === "sqlite") {
    const sqlite_path = hazo_config["hazo_connect"]?.["sqlite_path"];
    if (!sqlite_path) {
      return { status: "error", message: "SQLite path not configured" };
    }

    const full_path = path.isAbsolute(sqlite_path)
      ? sqlite_path
      : path.join(project_root, sqlite_path);

    if (file_exists(full_path)) {
      return { status: "ok", message: `SQLite database: ${sqlite_path}` };
    } else {
      return { status: "warning", message: "SQLite database file not found" };
    }
  } else if (db_type === "postgrest") {
    const postgrest_url = hazo_config["hazo_connect"]?.["postgrest_url"];
    if (postgrest_url) {
      return { status: "ok", message: `PostgREST: ${postgrest_url}` };
    } else {
      return { status: "error", message: "PostgREST URL not configured" };
    }
  }

  return { status: "warning", message: `Unknown database type: ${db_type}` };
}

function check_email(): { status: CheckStatus; message: string } {
  const zeptomail_key = process.env.ZEPTOMAIL_API_KEY;

  if (zeptomail_key && zeptomail_key.length > 0) {
    return { status: "ok", message: "ZEPTOMAIL_API_KEY is set" };
  }

  const project_root = process.cwd();
  const notify_config_path = path.join(project_root, "config", "hazo_notify_config.ini");
  const notify_config = read_ini_file(notify_config_path);

  if (notify_config) {
    const emailer_module = notify_config["emailer"]?.["emailer_module"];
    const from_email = notify_config["emailer"]?.["from_email"];

    if (emailer_module && from_email) {
      return {
        status: "warning",
        message: "Email configured but ZEPTOMAIL_API_KEY not set"
      };
    }
  }

  return { status: "error", message: "Email not configured" };
}

function check_routes(): Record<string, "ok" | "missing"> {
  const project_root = process.cwd();
  const possible_app_dirs = [
    path.join(project_root, "app"),
    path.join(project_root, "src", "app"),
  ];

  let app_dir: string | null = null;
  for (const dir of possible_app_dirs) {
    if (file_exists(dir)) {
      app_dir = dir;
      break;
    }
  }

  const results: Record<string, "ok" | "missing"> = {};

  for (const route of REQUIRED_ROUTES) {
    if (!app_dir) {
      results[route] = "missing";
      continue;
    }

    const route_path = path.join(app_dir, "api", "hazo_auth", route, "route.ts");
    const route_path_js = path.join(app_dir, "api", "hazo_auth", route, "route.js");
    results[route] = (file_exists(route_path) || file_exists(route_path_js)) ? "ok" : "missing";
  }

  return results;
}

function check_profile_pictures(): { status: CheckStatus; message: string } {
  const project_root = process.cwd();
  const library_path = path.join(project_root, "public", "profile_pictures", "library");

  if (file_exists(library_path)) {
    try {
      const files = fs.readdirSync(library_path);
      const image_files = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
      
      if (image_files.length > 0) {
        return { status: "ok", message: `${image_files.length} library images` };
      } else {
        return { status: "warning", message: "Library directory empty" };
      }
    } catch {
      return { status: "warning", message: "Cannot read library directory" };
    }
  }

  return { status: "warning", message: "Profile picture library not found" };
}

function generate_recommendations(
  config: { status: CheckStatus },
  database: { status: CheckStatus },
  email: { status: CheckStatus },
  routes: Record<string, "ok" | "missing">,
  profile_pictures: { status: CheckStatus }
): string[] {
  const recommendations: string[] = [];

  if (config.status === "error") {
    recommendations.push("Run: npx hazo_auth init");
  }

  if (database.status === "error") {
    recommendations.push("Configure database in config/hazo_auth_config.ini [hazo_connect] section");
  }

  if (email.status !== "ok") {
    recommendations.push("Set ZEPTOMAIL_API_KEY in .env.local for email functionality");
  }

  const missing_routes = Object.entries(routes)
    .filter(([, status]) => status === "missing")
    .map(([route]) => route);

  if (missing_routes.length > 0) {
    recommendations.push(`Create missing API routes (${missing_routes.length}): npx hazo_auth generate-routes`);
  }

  if (profile_pictures.status !== "ok") {
    recommendations.push("Copy profile pictures: cp -r node_modules/hazo_auth/public/profile_pictures public/");
  }

  return recommendations;
}

// section: api_handler
export async function GET() {
  // Only allow in development mode
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { 
        error: "Health check is disabled in production",
        hint: "This endpoint is only available when NODE_ENV is not 'production'"
      },
      { status: 403 }
    );
  }

  const config_check = check_config();
  const database_check = check_database();
  const email_check = check_email();
  const routes_check = check_routes();
  const profile_pictures_check = check_profile_pictures();

  const recommendations = generate_recommendations(
    config_check,
    database_check,
    email_check,
    routes_check,
    profile_pictures_check
  );

  // Determine overall status
  const all_statuses = [
    config_check.status,
    database_check.status,
    email_check.status,
    profile_pictures_check.status,
  ];

  const routes_status = Object.values(routes_check);
  const routes_ok = routes_status.every(s => s === "ok");

  let overall_status: "ok" | "partial" | "error";

  if (all_statuses.every(s => s === "ok") && routes_ok) {
    overall_status = "ok";
  } else if (all_statuses.some(s => s === "error") || routes_status.filter(s => s === "missing").length > 5) {
    overall_status = "error";
  } else {
    overall_status = "partial";
  }

  const response: HealthCheckResponse = {
    status: overall_status,
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    checks: {
      config: config_check,
      database: database_check,
      email: email_check,
      routes: routes_check,
      profile_pictures: profile_pictures_check,
    },
    recommendations,
  };

  return NextResponse.json(response);
}

