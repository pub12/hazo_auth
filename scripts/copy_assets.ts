import fs from 'fs';
import path from 'path';

function copyDir(src: string, dest: string) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Add .js extensions to local imports in TypeScript files for Node.js ESM compatibility.
 * This transforms imports like:
 *   import { foo } from "./bar"
 *   import { foo } from "../baz/qux"
 *   export * from "./bar"
 * To:
 *   import { foo } from "./bar.js"
 *   import { foo } from "../baz/qux.js"
 *   export * from "./bar.js"
 *
 * Only transforms local relative imports (starting with ./ or ../)
 * Does not transform external package imports or imports that already have extensions
 */
function addJsExtensionsToFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Match import/export statements with relative paths that don't have extensions
  // This regex handles:
  // - import { x } from "./path"
  // - import x from "../path"
  // - export { x } from "./path"
  // - export * from "./path"
  // - import * as x from "./path"
  const importRegex = /((?:import|export)\s+(?:(?:\{[^}]*\}|\*(?:\s+as\s+\w+)?|\w+)\s+from\s+)?["'])(\.\.?\/[^"']+?)(["'])/g;

  const transformed = content.replace(importRegex, (match, prefix, importPath, suffix) => {
    // Skip if already has an extension
    if (/\.(js|ts|tsx|json|css|scss)$/.test(importPath)) {
      return match;
    }
    // Add .js extension
    return `${prefix}${importPath}.js${suffix}`;
  });

  if (content !== transformed) {
    fs.writeFileSync(filePath, transformed);
    return true;
  }
  return false;
}

/**
 * Recursively process all .ts/.tsx/.js files in a directory to add .js extensions to imports
 */
function addJsExtensionsToDir(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let filesProcessed = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      filesProcessed += addJsExtensionsToDir(fullPath);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js')) {
      if (addJsExtensionsToFile(fullPath)) {
        filesProcessed++;
      }
    }
  }

  return filesProcessed;
}

const assetsDir = path.join(process.cwd(), 'src/assets');
const distAssetsDir = path.join(process.cwd(), 'dist/assets');

if (fs.existsSync(assetsDir)) {
    console.log(`Copying assets from ${assetsDir} to ${distAssetsDir}...`);
    copyDir(assetsDir, distAssetsDir);
    console.log('Assets copied successfully.');
} else {
    console.log('No assets directory found to copy.');
}

// Copy CLI and lib source files to cli-src directory for runtime execution
// This is needed because the CLI uses tsx to run TypeScript directly
// which avoids ESM module resolution issues with compiled JS
// Structure: cli-src/cli/* and cli-src/lib/* to maintain relative imports
const srcDir = path.join(process.cwd(), 'src');
const cliSrcDestDir = path.join(process.cwd(), 'cli-src');

// Copy CLI source
const cliSrcDir = path.join(srcDir, 'cli');
const cliDestDir = path.join(cliSrcDestDir, 'cli');

if (fs.existsSync(cliSrcDir)) {
    console.log(`Copying CLI source files from ${cliSrcDir} to ${cliDestDir}...`);
    copyDir(cliSrcDir, cliDestDir);
    console.log('CLI source files copied successfully.');
} else {
    console.log('No CLI source directory found to copy.');
}

// Copy lib source (required by CLI)
const libSrcDir = path.join(srcDir, 'lib');
const libDestDir = path.join(cliSrcDestDir, 'lib');

if (fs.existsSync(libSrcDir)) {
    console.log(`Copying lib files from ${libSrcDir} to ${libDestDir}...`);
    copyDir(libSrcDir, libDestDir);
    console.log('Lib files copied successfully.');
} else {
    console.log('No lib directory found to copy.');
}

// Copy only server/logging (required by lib/app_logger.ts)
// We don't copy the entire server directory as it contains routes that reference app/api
const loggingSrcDir = path.join(srcDir, 'server', 'logging');
const loggingDestDir = path.join(cliSrcDestDir, 'server', 'logging');

if (fs.existsSync(loggingSrcDir)) {
    console.log(`Copying server/logging files from ${loggingSrcDir} to ${loggingDestDir}...`);
    copyDir(loggingSrcDir, loggingDestDir);
    console.log('Server/logging files copied successfully.');
} else {
    console.log('No server/logging directory found to copy.');
}

// Copy assets/images (required by config files)
const assetsSrcDir2 = path.join(srcDir, 'assets');
const assetsDestDir2 = path.join(cliSrcDestDir, 'assets');

if (fs.existsSync(assetsSrcDir2)) {
    console.log(`Copying assets to cli-src from ${assetsSrcDir2} to ${assetsDestDir2}...`);
    copyDir(assetsSrcDir2, assetsDestDir2);
    console.log('Assets copied to cli-src successfully.');
} else {
    console.log('No assets directory found to copy to cli-src.');
}

// Copy server/types (required by server/logging/logger_service.ts)
const typesSrcDir = path.join(srcDir, 'server', 'types');
const typesDestDir = path.join(cliSrcDestDir, 'server', 'types');

if (fs.existsSync(typesSrcDir)) {
    console.log(`Copying server/types files from ${typesSrcDir} to ${typesDestDir}...`);
    copyDir(typesSrcDir, typesDestDir);
    console.log('Server/types files copied successfully.');
} else {
    console.log('No server/types directory found to copy.');
}

// Post-process dist: Add .js extensions to local imports for Node.js ESM compatibility
// This is required because Node.js ESM requires explicit file extensions in imports,
// but TypeScript doesn't add them automatically. We need to add them to compiled .js files.
console.log('Adding .js extensions to local imports in dist/ for Node.js ESM compatibility...');
const distDir = path.join(process.cwd(), 'dist');
const distFilesProcessed = addJsExtensionsToDir(distDir);
console.log(`Processed ${distFilesProcessed} files in dist/ with import transformations.`);

// Post-process cli-src: Add .js extensions to local imports for Node.js ESM compatibility
// This is required because Node.js ESM requires explicit file extensions in imports,
// but Next.js/Turbopack (used for the demo app) does not want them in TypeScript files.
// By adding them after copying, we maintain compatibility with both systems.
console.log('Adding .js extensions to local imports in cli-src for Node.js ESM compatibility...');
const filesProcessed = addJsExtensionsToDir(cliSrcDestDir);
console.log(`Processed ${filesProcessed} files in cli-src with import transformations.`);













