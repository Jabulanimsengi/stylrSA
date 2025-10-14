#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const { join } = require('node:path');

const npmCli = join(
  process.execPath,
  '..',
  'node_modules',
  'npm',
  'bin',
  'npm-cli.js'
);

const result = spawnSync(process.execPath, [npmCli, 'install'], {
  cwd: join(__dirname, '..', 'frontend'),
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  console.error('[install-frontend] Failed to launch npm:', result.error);
  process.exit(1);
}

if (result.status !== 0) {
  console.error('[install-frontend] npm install exited with code', result.status);
  process.exit(result.status ?? 1);
}

console.log('[install-frontend] frontend dependencies installed');
