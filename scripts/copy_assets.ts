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








