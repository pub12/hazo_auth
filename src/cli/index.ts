#!/usr/bin/env node
// file_description: main CLI entry point for hazo_auth commands
// This file is the bin entry for the hazo_auth package

// section: imports
import { run_validation } from "./validate.js";
import { generate_routes, type GenerateOptions } from "./generate.js";
import { handle_init } from "./init.js";
import { handle_init_users, show_init_users_help } from "./init_users.js";
import { handle_init_permissions, show_init_permissions_help } from "./init_permissions.js";

// section: constants
const VERSION = "1.6.0";

const HELP_TEXT = `
\x1b[1m🐸 hazo_auth CLI v${VERSION}\x1b[0m

Usage: hazo_auth <command> [options]

Commands:
  init               Initialize hazo_auth in your project (creates directories, copies config)
  init-permissions   Create default permissions from config (no user required)
  init-users         Initialize permissions, roles, and super user from config
  validate           Check your hazo_auth setup and configuration
  generate-routes    Generate API route files and pages in your project

Options:
  --help, -h         Show this help message
  --version, -v      Show version number

Examples:
  npx hazo_auth init
  npx hazo_auth init-permissions
  npx hazo_auth init-users
  npx hazo_auth validate
  npx hazo_auth generate-routes
  npx hazo_auth generate-routes --pages
  npx hazo_auth generate-routes --all --dir=src/app

Documentation:
  https://github.com/your-repo/hazo_auth/blob/main/SETUP_CHECKLIST.md

🦊
`;

// section: helpers
function parse_args(): { command?: string; args: string[]; help?: boolean; version?: boolean } {
  const argv = process.argv.slice(2);
  const result: { command?: string; args: string[]; help?: boolean; version?: boolean } = { args: [] };

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg === "--version" || arg === "-v") {
      result.version = true;
    } else if (!arg.startsWith("-") && !result.command) {
      result.command = arg;
    } else {
      result.args.push(arg);
    }
  }

  return result;
}

function show_help(): void {
  console.log(HELP_TEXT);
}

function show_version(): void {
  console.log(`hazo_auth v${VERSION}`);
}

// section: command_handlers
async function handle_validate(): Promise<void> {
  const summary = run_validation();
  process.exit(summary.failed > 0 ? 1 : 0);
}

function handle_generate_routes(args: string[]): void {
  const options: GenerateOptions = {};
  
  for (const arg of args) {
    if (arg.startsWith("--dir=")) {
      options.dir = arg.replace("--dir=", "");
    } else if (arg === "--pages") {
      options.pages = true;
    } else if (arg === "--all") {
      options.all = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
hazo_auth generate-routes

Generate API route files and page files in your Next.js project.

Usage:
  hazo_auth generate-routes [options]

Options:
  --dir=<path>    Specify the app directory (default: auto-detect)
  --pages         Generate page routes in addition to API routes
  --all           Generate everything (API routes + pages)
  --help, -h      Show this help message

Examples:
  hazo_auth generate-routes               # API routes only
  hazo_auth generate-routes --pages       # API routes + pages
  hazo_auth generate-routes --all         # Same as --pages
  hazo_auth generate-routes --dir=src/app # Specify app directory
`);
      return;
    }
  }

  generate_routes(options);
}

// section: main
async function main(): Promise<void> {
  const { command, args, help, version } = parse_args();

  if (version) {
    show_version();
    return;
  }

  // Show main help only if no command specified
  if (!command) {
    show_help();
    return;
  }

  // If help is requested but command exists, pass help to command handler
  // Commands can show their own help
  if (help) {
    args.push("--help");
  }

  switch (command) {
    case "init":
      if (help) {
        console.log(`
hazo_auth init

Initialize hazo_auth in your project.

Actions:
  - Creates public/profile_pictures/library/ directory
  - Creates public/profile_pictures/uploads/ directory
  - Creates data/ directory (for SQLite)
  - Copies hazo_auth_config.ini and hazo_notify_config.ini
  - Copies profile picture library images
  - Creates .env.local.example template
`);
        return;
      }
      handle_init();
      break;

    case "init-permissions": {
      if (help) {
        show_init_permissions_help();
        return;
      }
      await handle_init_permissions();
      break;
    }

    case "init-users": {
      if (help) {
        show_init_users_help();
        return;
      }
      // Parse --email option
      let email: string | undefined;
      for (const arg of args) {
        if (arg.startsWith("--email=")) {
          email = arg.replace("--email=", "");
        }
      }
      await handle_init_users({ email });
      break;
    }

    case "validate":
      if (help) {
        console.log(`
hazo_auth validate

Check your hazo_auth setup and configuration.

This command verifies:
  - Config files exist and are readable
  - Required config values are set
  - Environment variables are configured
  - Database connection works
  - Required directories exist
`);
        return;
      }
      await handle_validate();
      break;

    case "generate-routes":
      handle_generate_routes(args);
      break;

    default:
      console.error(`\x1b[31mUnknown command: ${command}\x1b[0m\n`);
      console.log("Run 'hazo_auth --help' for usage information.");
      process.exit(1);
  }
}

// Run main
main().catch((error) => {
  console.error("\x1b[31mError:\x1b[0m", error.message);
  process.exit(1);
});
