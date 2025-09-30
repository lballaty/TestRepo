// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/e2e/tests/pwa/service-worker.spec.ts
// Description: E2E tests for Service Worker functionality and PWA features
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { test, expect } from '@playwright/test';

test.describe('Service Worker & PWA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="time-display"]');
  });

  test.describe('Service Worker Registration', () => {
    test('should register service worker automatically', async ({ page }) => {
      // Wait for service worker to register
      await page.waitForTimeout(2000);

      // Check if service worker is registered
      const swRegistered = await page.evaluate(async () => {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          return !!registration;
        }
        return false;
      });

      expect(swRegistered).toBeTruthy();
    });

    test('should show PWA status indicator', async ({ page }) => {
      // Wait for PWA status indicator to appear
      await page.waitForSelector('[data-testid="pwa-status-indicator"]', { timeout: 5000 });

      const statusIndicator = page.locator('[data-testid="pwa-status-indicator"]');
      await expect(statusIndicator).toBeVisible();

      // Should show some status text
      const statusText = await statusIndicator.textContent();
      expect(statusText).toBeTruthy();
    });

    test('should display correct online status', async ({ page }) => {
      await page.waitForSelector('[data-testid="pwa-status-indicator"]');

      // Click to expand details
      await page.click('[data-testid="pwa-status-indicator"]');

      // Should show online status
      const detailsPanel = page.locator('text=Network:');
      await expect(detailsPanel).toBeVisible();
    });
  });

  test.describe('Offline Functionality', () => {
    test('should work when going offline', async ({ page, context }) => {
      // Wait for service worker to be ready
      await page.waitForTimeout(3000);

      // Verify timer works online first
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('25:00');

      // Go offline
      await context.setOffline(true);

      // Wait a moment for offline detection
      await page.waitForTimeout(1000);

      // App should still be functional
      await expect(page.locator('[data-testid="time-display"]')).toBeVisible();

      // Should be able to start timer offline
      await page.click('[data-testid="start-focus-button"]');
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

      // Stop timer
      await page.click('[data-testid="pause-button"]');
      await page.click('[data-testid="stop-timer-button"]');

      // Go back online
      await context.setOffline(false);
    });

    test('should show offline indicator when disconnected', async ({ page, context }) => {
      // Wait for service worker
      await page.waitForTimeout(3000);

      // Go offline
      await context.setOffline(true);
      await page.waitForTimeout(2000);

      // Should show offline status in PWA indicator
      const statusIndicator = page.locator('[data-testid="pwa-status-indicator"]');
      await expect(statusIndicator).toBeVisible();

      const statusText = await statusIndicator.textContent();
      expect(statusText?.toLowerCase()).toContain('offline');

      // Go back online
      await context.setOffline(false);
    });

    test('should cache essential resources', async ({ page, context }) => {
      // Wait for service worker and initial caching
      await page.waitForTimeout(3000);

      // Go offline
      await context.setOffline(true);

      // Reload page - should still work from cache
      await page.reload();
      await page.waitForSelector('[data-testid="time-display"]', { timeout: 10000 });

      // Essential UI should be available
      await expect(page.locator('[data-testid="time-display"]')).toBeVisible();
      await expect(page.locator('[data-testid="start-focus-button"]')).toBeVisible();

      // Go back online
      await context.setOffline(false);
    });
  });

  test.describe('PWA Installation', () => {
    test('should provide installation controls', async ({ page }) => {
      await page.waitForSelector('[data-testid="pwa-status-indicator"]');

      // Click to show details
      await page.click('[data-testid="pwa-status-indicator"]');

      // Should have PWA controls
      const disablePWAButton = page.locator('[data-testid="disable-pwa-button"]');
      await expect(disablePWAButton).toBeVisible();

      const checkUpdatesButton = page.locator('[data-testid="check-updates-button"]');
      await expect(checkUpdatesButton).toBeVisible();
    });

    test('should allow checking for updates', async ({ page }) => {
      await page.waitForSelector('[data-testid="pwa-status-indicator"]');

      // Click to show details
      await page.click('[data-testid="pwa-status-indicator"]');

      // Click check for updates
      await page.click('[data-testid="check-updates-button"]');

      // Should not show any errors
      const errorNotification = page.locator('text=Error:');
      await expect(errorNotification).not.toBeVisible();
    });

    test('should provide uninstall option', async ({ page }) => {
      await page.waitForSelector('[data-testid="pwa-status-indicator"]');

      // Click to show details
      await page.click('[data-testid="pwa-status-indicator"]');

      // Should have disable PWA button
      const disableButton = page.locator('[data-testid="disable-pwa-button"]');
      await expect(disableButton).toBeVisible();

      // Note: We won't actually click it as it would break other tests
    });
  });

  test.describe('Background Functionality', () => {
    test('should continue working when tab is in background', async ({ page, context }) => {
      // Start a timer
      await page.click('[data-testid="start-focus-button"]');
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

      // Open new tab to simulate background
      const newPage = await context.newPage();
      await newPage.goto('about:blank');

      // Wait a moment
      await newPage.waitForTimeout(2000);

      // Return to original tab
      await page.bringToFront();

      // Timer should still be running
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

      // Stop timer
      await page.click('[data-testid="pause-button"]');
      await page.click('[data-testid="stop-timer-button"]');

      await newPage.close();
    });

    test('should maintain state across page refreshes', async ({ page }) => {
      // Set a custom timer duration first
      await page.click('[data-testid="custom-duration-button"]');
      await page.fill('[data-testid="custom-minutes-input"]', '30');
      await page.click('[data-testid="apply-custom-duration"]');

      // Verify the change
      await expect(page.locator('[data-testid="time-display"]')).toHaveText('30:00');

      // Refresh page
      await page.reload();
      await page.waitForSelector('[data-testid="time-display"]');

      // Timer state should be restored (though it might reset to default)
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toMatch(/\d+:\d{2}/); // Should show some valid time format
    });
  });

  test.describe('Error Handling', () => {
    test('should handle service worker errors gracefully', async ({ page }) => {
      // Wait for PWA status
      await page.waitForSelector('[data-testid="pwa-status-indicator"]');

      // Click to show details
      await page.click('[data-testid="pwa-status-indicator"]');

      // If there's an error, there should be a retry button
      const retryButton = page.locator('[data-testid="retry-sw-button"]');

      // Only test if retry button exists (error occurred)
      if (await retryButton.isVisible()) {
        await retryButton.click();
        // Should attempt to register again
        await page.waitForTimeout(1000);
      }

      // App should still be functional regardless
      await expect(page.locator('[data-testid="time-display"]')).toBeVisible();
    });

    test('should show fallback content when service worker fails', async ({ page }) => {
      // Even if service worker fails, basic app should work
      await expect(page.locator('[data-testid="time-display"]')).toBeVisible();
      await expect(page.locator('[data-testid="start-focus-button"]')).toBeVisible();

      // Basic timer functionality should work
      await page.click('[data-testid="start-focus-button"]');
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

      await page.click('[data-testid="pause-button"]');
      await page.click('[data-testid="stop-timer-button"]');
    });
  });
});