#!/usr/bin/env node

const { cpSync, existsSync, rmSync, symlinkSync, unlinkSync } = require('node:fs');
const { join } = require('node:path');

const shouldSync =
  process.env.VERCEL === '1' ||
  process.env.CI === 'true' ||
  process.env.SYNC_NEXT_OUTPUT === '1';

if (!shouldSync) {
  console.log('[sync-next-output] Skipping copy (set VERCEL=1 or SYNC_NEXT_OUTPUT=1 to enable).');
  process.exit(0);
}

const source = join(__dirname, '..', 'frontend', '.next');
const target = join(__dirname, '..', '.next');

if (!existsSync(source)) {
  console.error(`[sync-next-output] Next.js output not found at ${source}`);
  process.exit(1);
}

try {
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
  }

  cpSync(source, target, { recursive: true });
  console.log(`[sync-next-output] Copied ${source} -> ${target}`);

  // Symlink frontend node_modules to root for Vercel trace phase
  const frontendNodeModules = join(__dirname, '..', 'frontend', 'node_modules');
  const rootNodeModules = join(__dirname, '..', 'node_modules');
  
  // Copy missing packages from frontend to root node_modules
  if (existsSync(frontendNodeModules) && existsSync(rootNodeModules)) {
    const packagesToSync = ['debug', 'ms', 'supports-color', 'has-flag'];
    for (const pkg of packagesToSync) {
      const srcPkg = join(frontendNodeModules, pkg);
      const destPkg = join(rootNodeModules, pkg);
      if (existsSync(srcPkg) && !existsSync(destPkg)) {
        try {
          cpSync(srcPkg, destPkg, { recursive: true });
          console.log(`[sync-next-output] Copied ${pkg} to root node_modules`);
        } catch (e) {
          console.warn(`[sync-next-output] Could not copy ${pkg}:`, e.message);
        }
      }
    }
  }
} catch (error) {
  console.error('[sync-next-output] Failed to sync Next.js output:', error);
  process.exit(1);
}
