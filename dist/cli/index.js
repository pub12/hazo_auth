#!/usr/bin/env node
// file_description: main CLI entry point for hazo_auth commands
// This file is the bin entry for the hazo_auth package
// section: imports
import { run_validation } from "./validate.js";
import { generate_routes } from "./generate.js";
// section: constants
const VERSION = "1.5.0";
const HELP_TEXT = `
\x1b[1m🐸 hazo_auth CLI v${VERSION}\x1b[0m

Usage: hazo_auth <command> [options]

Commands:
  validate           Check your hazo_auth setup and configuration
  generate-routes    Generate API route files in your project

Options:
  --help, -h         Show this help message
  --version, -v      Show version number

Examples:
  npx hazo_auth validate
  npx hazo_auth generate-routes
  npx hazo_auth generate-routes --dir=src/app

Documentation:
  https://github.com/your-repo/hazo_auth/blob/main/SETUP_CHECKLIST.md

🦊
`;
// section: helpers
function parse_args() {
    const argv = process.argv.slice(2);
    const result = { args: [] };
    for (const arg of argv) {
        if (arg === "--help" || arg === "-h") {
            result.help = true;
        }
        else if (arg === "--version" || arg === "-v") {
            result.version = true;
        }
        else if (!arg.startsWith("-") && !result.command) {
            result.command = arg;
        }
        else {
            result.args.push(arg);
        }
    }
    return result;
}
function show_help() {
    console.log(HELP_TEXT);
}
function show_version() {
    console.log(`hazo_auth v${VERSION}`);
}
// section: command_handlers
async function handle_validate() {
    const summary = run_validation();
    process.exit(summary.failed > 0 ? 1 : 0);
}
function handle_generate_routes(args) {
    // Parse --dir argument
    let dir;
    for (const arg of args) {
        if (arg.startsWith("--dir=")) {
            dir = arg.replace("--dir=", "");
        }
        else if (arg === "--help" || arg === "-h") {
            console.log(`
hazo_auth generate-routes

Generate API route files in your Next.js project.

Usage:
  hazo_auth generate-routes [options]

Options:
  --dir=<path>    Specify the app directory (default: auto-detect)
  --help, -h      Show this help message

Examples:
  hazo_auth generate-routes
  hazo_auth generate-routes --dir=src/app
`);
            return;
        }
    }
    generate_routes(dir);
}
// section: main
async function main() {
    const { command, args, help, version } = parse_args();
    if (version) {
        show_version();
        return;
    }
    if (help || !command) {
        show_help();
        return;
    }
    switch (command) {
        case "validate":
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
