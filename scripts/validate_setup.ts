#!/usr/bin/env node
// file_description: thin wrapper for validation script (for local development)
// The main logic is in src/cli/validate.ts
// This script can be run via `npm run validate` during hazo_auth development

// Re-export from CLI module for local development
export { run_validation, type ValidationSummary } from "../src/cli/validate";

import { run_validation } from "../src/cli/validate";

// Run if called directly
if (process.argv[1]?.includes("validate_setup") || process.argv[1]?.includes("validate")) {
  const summary = run_validation();
  process.exit(summary.failed > 0 ? 1 : 0);
}
