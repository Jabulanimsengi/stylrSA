#!/usr/bin/env node

const { cpSync, existsSync, rmSync } = require('node:fs');
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
} catch (error) {
  console.error('[sync-next-output] Failed to sync Next.js output:', error);
  process.exit(1);
}
