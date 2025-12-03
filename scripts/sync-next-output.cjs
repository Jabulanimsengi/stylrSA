#!/usr/bin/env node

const { cpSync, existsSync, rmSync, readdirSync, statSync } = require('node:fs');
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

  // Copy ALL packages from frontend node_modules to root for Vercel trace phase
  const frontendNodeModules = join(__dirname, '..', 'frontend', 'node_modules');
  const rootNodeModules = join(__dirname, '..', 'node_modules');
  
  if (existsSync(frontendNodeModules) && existsSync(rootNodeModules)) {
    console.log('[sync-next-output] Syncing node_modules from frontend to root...');
    let copied = 0;
    let skipped = 0;
    
    const entries = readdirSync(frontendNodeModules);
    for (const entry of entries) {
      const srcPkg = join(frontendNodeModules, entry);
      const destPkg = join(rootNodeModules, entry);
      
      // Skip if already exists in root
      if (existsSync(destPkg)) {
        skipped++;
        continue;
      }
      
      try {
        const stat = statSync(srcPkg);
        if (stat.isDirectory()) {
          cpSync(srcPkg, destPkg, { recursive: true });
          copied++;
        }
      } catch (e) {
        // Ignore errors for individual packages
      }
    }
    
    console.log(`[sync-next-output] Copied ${copied} packages, skipped ${skipped} existing`);
  }
} catch (error) {
  console.error('[sync-next-output] Failed to sync Next.js output:', error);
  process.exit(1);
}
