#!/usr/bin/env node
// file_description: thin wrapper for route generator (for local development)
// The main logic is in src/cli/generate.ts
// This script can be run via `npm run generate-routes` during hazo_auth development

// Re-export from CLI module for local development
export { generate_routes } from "../src/cli/generate";

import { generate_routes } from "../src/cli/generate";

// Parse CLI arguments
function parse_args(): { dir?: string; help?: boolean } {
  const args: { dir?: string; help?: boolean } = {};
  
  for (const arg of process.argv.slice(2)) {
    if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (arg.startsWith("--dir=")) {
      args.dir = arg.replace("--dir=", "");
    }
  }

  return args;
}

function show_help(): void {
  console.log(`
hazo_auth Route Generator

Usage:
  npx hazo_auth generate-routes [options]

Options:
  --dir=<path>    Specify the app directory (default: auto-detect app/ or src/app/)
  --help, -h      Show this help message

Examples:
  npx hazo_auth generate-routes
  npx hazo_auth generate-routes --dir=src/app
  npx hazo_auth generate-routes --dir=app
`);
}

// Run if called directly
const is_main = process.argv[1]?.includes("generate_routes") || 
                process.argv[1]?.includes("generate-routes");

if (is_main) {
  const args = parse_args();

  if (args.help) {
    show_help();
    process.exit(0);
  }

  generate_routes(args.dir);
}
