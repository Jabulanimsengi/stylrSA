import { spawn } from 'node:child_process';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

// Run Playwright programmatically
const { chromium } = await import('playwright');

const FRONTEND_DIR = 'C:/Users/ramos/all_coding/hairprosdirectory/frontend';
const NEXT_BIN = process.platform === 'win32'
  ? 'C:/Users/ramos/all_coding/hairprosdirectory/frontend/node_modules/.bin/next.cmd'
  : 'C:/Users/ramos/all_coding/hairprosdirectory/frontend/node_modules/.bin/next';
const URL = 'http://localhost:3001/test-toast-debug';

function startDevServer() {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === 'win32';
    const cmd = NEXT_BIN;
    const args = ['dev', '-p', '3001'];
    const child = spawn(cmd, args, {
      cwd: FRONTEND_DIR,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let ready = false;
    const onData = (data) => {
      const text = data.toString();
      if (/http:\/\/localhost:3001|ready - Local/i.test(text)) {
        ready = true;
        resolve(child);
      }
    };

    child.stdout.on('data', onData);
    child.stderr.on('data', onData);

    child.on('exit', (code) => {
      if (!ready) reject(new Error(`Dev server exited early with code ${code}`));
    });

    // Safety: fail if not ready within 60s
    setTimeout(() => {
      if (!ready) {
        try { child.kill(); } catch {}
        reject(new Error('Dev server did not become ready within 60s'));
      }
    }, 60000).unref();
  });
}

async function run() {
  let server;
  const browser = await chromium.launch({ headless: true });
  try {
    server = await startDevServer();

    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('text=Toast Notification Debug Page', { timeout: 30000 });

    // Test 1: Close via X button
    await page.getByRole('button', { name: 'Test Success Toast' }).click();
    await page.waitForSelector('.Toastify__toast', { state: 'visible', timeout: 10000 });
    await page.click('.Toastify__close-button');
    await page.waitForSelector('.Toastify__toast', { state: 'detached', timeout: 10000 });

    // Test 2: Close by clicking toast body
    await page.getByRole('button', { name: 'Test Success Toast' }).click();
    const toast = await page.waitForSelector('.Toastify__toast', { state: 'visible', timeout: 10000 });
    await toast.click();
    await page.waitForSelector('.Toastify__toast', { state: 'detached', timeout: 10000 });

    console.log('OK: Toast closes by X and by click');
    process.exit(0);
  } catch (err) {
    console.error('FAIL:', err?.message || err);
    process.exit(1);
  } finally {
    await delay(250);
    try { await (await chromium.launch()).close(); } catch {}
    try { await (await chromium.launch()).close(); } catch {}
    try { await browser.close(); } catch {}
    if (server) {
      try { server.kill(); } catch {}
    }
  }
}

run();
