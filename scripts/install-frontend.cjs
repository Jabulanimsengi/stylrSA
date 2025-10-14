#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const { join } = require('node:path');

const cwd = join(__dirname, '..', 'frontend');
const env = { ...process.env };

const attempts = [];

if (env.npm_execpath && existsSync(env.npm_execpath)) {
  attempts.push({
    label: 'npm_execpath',
    command: process.execPath,
    args: [env.npm_execpath, 'install'],
  });
}

const bundledCli = join(
  process.execPath,
  '..',
  'node_modules',
  'npm',
  'bin',
  'npm-cli.js'
);

if (existsSync(bundledCli)) {
  attempts.push({
    label: 'bundled npm-cli',
    command: process.execPath,
    args: [bundledCli, 'install'],
  });
}

const npmBinary = process.platform === 'win32' ? 'npm.cmd' : 'npm';
attempts.push({
  label: 'npm binary',
  command: npmBinary,
  args: ['install'],
  options: { shell: process.platform === 'win32' },
});

for (const attempt of attempts) {
  const result = spawnSync(attempt.command, attempt.args, {
    cwd,
    stdio: 'inherit',
    env,
    ...(attempt.options ?? {}),
  });

  if (result.error) {
    console.warn(
      `[install-frontend] ${attempt.label} failed to launch:`,
      result.error.message
    );
    continue;
  }

  if ((result.status ?? 1) === 0) {
    console.log('[install-frontend] frontend dependencies installed');
    process.exit(0);
  }

  console.warn(
    `[install-frontend] ${attempt.label} exited with code ${result.status}`
  );
}

console.error('[install-frontend] Unable to install frontend dependencies.');
process.exit(1);
