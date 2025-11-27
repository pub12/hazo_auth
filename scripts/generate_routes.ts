#!/usr/bin/env node
// file_description: thin wrapper for route generator (for local development)
// The main logic is in src/cli/generate.ts
// This script can be run via `npm run generate-routes` during hazo_auth development

// Re-export from CLI module for local development
export { generate_routes } from "../src/cli/generate";

import { generate_routes, type GenerateOptions } from "../src/cli/generate";

// Parse CLI arguments
function parse_args(): GenerateOptions & { help?: boolean } {
  const args: GenerateOptions & { help?: boolean } = {};
  
  for (const arg of process.argv.slice(2)) {
    if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (arg.startsWith("--dir=")) {
      args.dir = arg.replace("--dir=", "");
    } else if (arg === "--pages") {
      args.pages = true;
    } else if (arg === "--all") {
      args.all = true;
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
  --pages         Generate page routes in addition to API routes
  --all           Generate everything (API routes + pages)
  --help, -h      Show this help message

Examples:
  npx hazo_auth generate-routes
  npx hazo_auth generate-routes --pages
  npx hazo_auth generate-routes --all
  npx hazo_auth generate-routes --dir=src/app
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

  const { help, ...options } = args;
  generate_routes(options);
}
