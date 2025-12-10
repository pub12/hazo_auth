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






