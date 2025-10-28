import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';
const TEST_PAGE = `${BASE_URL}/test-toast-debug`;

test.describe('Toast Notification Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_PAGE);
    await page.waitForLoadState('networkidle');
  });

  test('should display toast at bottom-right position', async ({ page }) => {
    // Click button to trigger toast
    await page.click('button:has-text("Test Success Toast")');
    
    // Wait for toast to appear
    const toast = page.locator('.Toastify__toast').first();
    await expect(toast).toBeVisible({ timeout: 3000 });
    
    // Check container position
    const container = page.locator('.Toastify__toast-container');
    const box = await container.boundingBox();
    const viewport = page.viewportSize();
    
    if (box && viewport) {
      // Should be at bottom-right (within reasonable margin)
      expect(box.x).toBeGreaterThan(viewport.width / 2);
      expect(box.y).toBeGreaterThan(viewport.height / 2);
    }
  });

  test('should close toast when clicking X button', async ({ page }) => {
    // Trigger toast
    await page.click('button:has-text("Test Success Toast")');
    
    // Wait for toast to appear
    const toast = page.locator('.Toastify__toast').first();
    await expect(toast).toBeVisible({ timeout: 3000 });
    
    // Click the close button
    const closeButton = toast.locator('.Toastify__close-button');
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    
    // Toast should disappear
    await expect(toast).not.toBeVisible({ timeout: 2000 });
  });

  test('should close toast when clicking on toast body', async ({ page }) => {
    // Trigger toast
    await page.click('button:has-text("Test Error Toast")');
    
    // Wait for toast to appear
    const toast = page.locator('.Toastify__toast').first();
    await expect(toast).toBeVisible({ timeout: 3000 });
    
    // Click anywhere on the toast body
    const toastBody = toast.locator('.Toastify__toast-body');
    await toastBody.click();
    
    // Toast should disappear
    await expect(toast).not.toBeVisible({ timeout: 2000 });
  });

  test('should respect toast limit of 3', async ({ page }) => {
    // Trigger multiple toasts
    await page.click('button:has-text("Test Multiple Toasts")');
    
    // Wait a bit for all toasts to appear
    await page.waitForTimeout(1000);
    
    // Count visible toasts
    const toasts = page.locator('.Toastify__toast');
    const count = await toasts.count();
    
    // Should show maximum 3 toasts
    expect(count).toBeLessThanOrEqual(3);
  });

  test('should have proper pointer-events on close button', async ({ page }) => {
    // Trigger toast
    await page.click('button:has-text("Test Info Toast")');
    
    // Wait for toast
    const toast = page.locator('.Toastify__toast').first();
    await expect(toast).toBeVisible({ timeout: 3000 });
    
    // Check close button styles
    const closeButton = toast.locator('.Toastify__close-button');
    const pointerEvents = await closeButton.evaluate(el => 
      window.getComputedStyle(el).pointerEvents
    );
    const cursor = await closeButton.evaluate(el => 
      window.getComputedStyle(el).cursor
    );
    
    expect(pointerEvents).toBe('auto');
    expect(cursor).toBe('pointer');
  });

  test('should have auto pointer-events on toast body', async ({ page }) => {
    // Trigger toast
    await page.click('button:has-text("Test Warning Toast")');
    
    // Wait for toast
    const toast = page.locator('.Toastify__toast').first();
    await expect(toast).toBeVisible({ timeout: 3000 });
    
    // Check toast body styles
    const toastBody = toast.locator('.Toastify__toast-body');
    const pointerEvents = await toastBody.evaluate(el => 
      window.getComputedStyle(el).pointerEvents
    );
    
    // Should be 'auto' to allow clicking
    expect(pointerEvents).toBe('auto');
  });

  test('should auto-close after timeout', async ({ page }) => {
    // Trigger toast with short timeout
    await page.click('button:has-text("Test Success Toast")');
    
    // Wait for toast to appear
    const toast = page.locator('.Toastify__toast').first();
    await expect(toast).toBeVisible({ timeout: 3000 });
    
    // Wait for auto-close (5 seconds + buffer)
    await expect(toast).not.toBeVisible({ timeout: 7000 });
  });
});
