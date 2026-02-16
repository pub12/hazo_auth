#!/usr/bin/env node
// file_description: CLI entry wrapper that handles ESM module resolution
// This wrapper ensures the CLI works in consuming projects with proper module resolution

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the path to the CLI TypeScript source file (included in the package)
// Structure: cli-src/cli/index.ts and cli-src/lib/* for relative imports
const cliPath = join(__dirname, '..', 'cli-src', 'cli', 'index.ts');

const args = process.argv.slice(2);

// Use tsx to run the TypeScript source directly
// This avoids ESM module resolution issues with compiled JS
// tsx is a dependency of hazo_auth so it should be available
const existingNodeOptions = process.env.NODE_OPTIONS || '';
const reactServerCondition = '--conditions react-server';
const nodeOptions = existingNodeOptions.includes(reactServerCondition)
  ? existingNodeOptions
  : `${existingNodeOptions} ${reactServerCondition}`.trim();

const child = spawn('npx', ['tsx', cliPath, ...args], {
  stdio: 'inherit',
  cwd: process.cwd(),
  shell: true,
  env: { ...process.env, NODE_OPTIONS: nodeOptions },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

child.on('error', (err) => {
  console.error('Failed to start CLI:', err.message);
  console.error('Make sure tsx is available: npm install -D tsx');
  process.exit(1);
});
