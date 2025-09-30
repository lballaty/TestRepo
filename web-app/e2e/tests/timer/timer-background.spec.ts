// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/e2e/tests/timer/timer-background.spec.ts
// Description: E2E tests for Web Worker background timer functionality on iOS PWA
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { test, expect } from '@playwright/test';

test.describe('Background Timer Web Worker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="time-display"]');
  });

  test('should load timer worker script', async ({ page }) => {
    // Check if worker script is accessible
    const response = await page.goto('/timer-worker.js');
    expect(response?.status()).toBe(200);

    // Go back to main page
    await page.goto('/');
  });

  test('should initialize Web Worker on iOS devices', async ({ page, browserName }) => {
    // Inject iOS user agent for testing
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        configurable: true
      });
    });

    await page.reload();
    await page.waitForSelector('[data-testid="time-display"]');

    // Check console for worker initialization
    const consoleMessages: string[] = [];
    page.on('console', msg => consoleMessages.push(msg.text()));

    // Start timer to trigger worker
    await page.click('[data-testid="start-focus-button"]');
    await page.waitForTimeout(500);

    // Worker should be initialized without errors
    const hasWorkerError = consoleMessages.some(msg =>
      msg.includes('Failed to initialize timer worker')
    );
    expect(hasWorkerError).toBe(false);
  });

  test('should continue timer in background simulation', async ({ page }) => {
    // Start timer
    await page.click('[data-testid="duration-30s"]');
    await page.click('[data-testid="start-focus-button"]');

    // Get initial time
    const initialTime = await page.textContent('[data-testid="time-display"]');
    expect(initialTime).toBe('00:30');

    // Wait 2 seconds
    await page.waitForTimeout(2000);

    // Check timer has counted down
    const updatedTime = await page.textContent('[data-testid="time-display"]');
    const seconds = parseInt(updatedTime!.split(':')[1]);
    expect(seconds).toBeLessThanOrEqual(28);
    expect(seconds).toBeGreaterThanOrEqual(27);

    // Simulate page visibility change (backgrounding)
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        value: true,
        configurable: true
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Wait while "backgrounded"
    await page.waitForTimeout(2000);

    // Simulate returning to foreground
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        value: false,
        configurable: true
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Timer should have continued counting
    const finalTime = await page.textContent('[data-testid="time-display"]');
    const finalSeconds = parseInt(finalTime!.split(':')[1]);
    expect(finalSeconds).toBeLessThanOrEqual(26);
  });

  test('should handle pause and resume with Web Worker', async ({ page }) => {
    // Start timer
    await page.click('[data-testid="duration-30s"]');
    await page.click('[data-testid="start-focus-button"]');

    // Wait a bit
    await page.waitForTimeout(1000);

    // Pause timer
    await page.click('[data-testid="pause-button"]');
    const pausedTime = await page.textContent('[data-testid="time-display"]');

    // Wait while paused
    await page.waitForTimeout(2000);

    // Time should not have changed while paused
    const stillPausedTime = await page.textContent('[data-testid="time-display"]');
    expect(stillPausedTime).toBe(pausedTime);

    // Resume timer
    await page.click('[data-testid="resume-button"]');

    // Wait and verify it's counting again
    await page.waitForTimeout(1000);
    const resumedTime = await page.textContent('[data-testid="time-display"]');
    expect(resumedTime).not.toBe(pausedTime);
  });

  test('should handle timer completion with Web Worker', async ({ page }) => {
    // Set very short timer for testing
    await page.click('[data-testid="custom-duration-button"]');
    await page.fill('[data-testid="custom-minutes-input"]', '0');
    await page.fill('[data-testid="custom-seconds-input"]', '3');
    await page.click('[data-testid="apply-custom-duration"]');

    // Start timer
    await page.click('[data-testid="start-focus-button"]');

    // Wait for completion
    await page.waitForTimeout(4000);

    // Should show completion state
    const timeDisplay = await page.textContent('[data-testid="time-display"]');
    expect(timeDisplay).toBe('00:00');

    // Progress should be 100%
    const progressText = await page.textContent('text=/100% complete/');
    expect(progressText).toContain('100% complete');
  });

  test('should sync worker state with main thread', async ({ page }) => {
    // Start timer
    await page.click('[data-testid="duration-1min"]');
    await page.click('[data-testid="start-focus-button"]');

    // Get initial state
    await page.waitForTimeout(500);
    const runningStatus = await page.textContent('text=/Timer Status/');
    expect(runningStatus).toContain('running');

    // Pause
    await page.click('[data-testid="pause-button"]');
    await page.waitForTimeout(500);
    const pausedStatus = await page.textContent('text=/Timer Status/');
    expect(pausedStatus).toContain('paused');

    // Stop
    await page.click('[data-testid="stop-button"]');
    await page.waitForTimeout(500);
    const stoppedStatus = await page.textContent('text=/Timer Status/');
    expect(stoppedStatus).toContain('stopped');
  });

  test('should clean up worker on page unload', async ({ page, context }) => {
    // Start timer
    await page.click('[data-testid="start-focus-button"]');

    // Create a new page (simulating navigation)
    const newPage = await context.newPage();
    await newPage.goto('/');

    // Close original page
    await page.close();

    // New page should have fresh timer state
    const timeDisplay = await newPage.textContent('[data-testid="time-display"]');
    expect(timeDisplay).toBe('25:00'); // Default duration

    const status = await newPage.textContent('text=/Timer Status/');
    expect(status).toContain('idle');
  });
});