// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/e2e/tests/timer/timer-duration.spec.ts
// Description: E2E tests for timer duration selection including exercise intervals and custom durations
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { test, expect } from '@playwright/test';

test.describe('Timer Duration Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="time-display"]');
  });

  test.describe('Exercise Interval Presets', () => {
    test('should set timer to 30 seconds for exercise intervals', async ({ page }) => {
      await page.click('[data-testid="duration-30s"]');
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('00:30');
    });

    test('should set timer to 45 seconds for HIIT training', async ({ page }) => {
      await page.click('[data-testid="duration-45s"]');
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('00:45');
    });

    test('should set timer to 1 minute for recovery periods', async ({ page }) => {
      await page.click('[data-testid="duration-1min"]');
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('01:00');
    });
  });

  test.describe('Work Session Presets', () => {
    test('should set timer to 5 minutes for short focus', async ({ page }) => {
      await page.click('[data-testid="duration-5min"]');
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('05:00');
    });

    test('should set timer to 15 minutes for medium focus', async ({ page }) => {
      await page.click('[data-testid="duration-15min"]');
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('15:00');
    });

    test('should set timer to 25 minutes for Pomodoro', async ({ page }) => {
      await page.click('[data-testid="duration-25min"]');
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('25:00');
    });
  });

  test.describe('Custom Duration Input', () => {
    test('should open custom duration panel when button clicked', async ({ page }) => {
      await page.click('[data-testid="custom-duration-button"]');

      const minutesInput = page.locator('[data-testid="custom-minutes-input"]');
      const secondsInput = page.locator('[data-testid="custom-seconds-input"]');

      await expect(minutesInput).toBeVisible();
      await expect(secondsInput).toBeVisible();
    });

    test('should set custom duration with minutes and seconds', async ({ page }) => {
      await page.click('[data-testid="custom-duration-button"]');

      await page.fill('[data-testid="custom-minutes-input"]', '2');
      await page.fill('[data-testid="custom-seconds-input"]', '30');
      await page.click('[data-testid="apply-custom-duration"]');

      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('02:30');
    });

    test('should handle only seconds input for intervals', async ({ page }) => {
      await page.click('[data-testid="custom-duration-button"]');

      await page.fill('[data-testid="custom-minutes-input"]', '0');
      await page.fill('[data-testid="custom-seconds-input"]', '45');
      await page.click('[data-testid="apply-custom-duration"]');

      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('00:45');
    });

    test('should handle only minutes input for long sessions', async ({ page }) => {
      await page.click('[data-testid="custom-duration-button"]');

      await page.fill('[data-testid="custom-minutes-input"]', '90');
      await page.fill('[data-testid="custom-seconds-input"]', '0');
      await page.click('[data-testid="apply-custom-duration"]');

      // 90 minutes displays as 01:30:00 (hours:minutes:seconds format)
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('01:30:00');
    });

    test('should limit seconds input to max 59', async ({ page }) => {
      await page.click('[data-testid="custom-duration-button"]');

      await page.fill('[data-testid="custom-seconds-input"]', '99');
      await page.click('[data-testid="apply-custom-duration"]');

      // Should cap at 59 seconds
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('25:59'); // 25 is default minutes
    });

    test('should cancel custom duration without applying', async ({ page }) => {
      const initialTime = await page.textContent('[data-testid="time-display"]');

      await page.click('[data-testid="custom-duration-button"]');
      await page.fill('[data-testid="custom-minutes-input"]', '10');
      await page.fill('[data-testid="custom-seconds-input"]', '30');
      await page.click('[data-testid="cancel-custom-duration"]');

      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe(initialTime);
    });

    test('should handle zero duration gracefully', async ({ page }) => {
      await page.click('[data-testid="custom-duration-button"]');

      await page.fill('[data-testid="custom-minutes-input"]', '0');
      await page.fill('[data-testid="custom-seconds-input"]', '0');
      await page.click('[data-testid="apply-custom-duration"]');

      // Should not apply zero duration
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).not.toBe('00:00');
    });
  });

  test.describe('Duration Change During Timer States', () => {
    test('should allow duration change when timer is idle', async ({ page }) => {
      await page.click('[data-testid="duration-5min"]');
      expect(await page.textContent('[data-testid="time-display"]')).toBe('05:00');

      await page.click('[data-testid="duration-30s"]');
      expect(await page.textContent('[data-testid="time-display"]')).toBe('00:30');
    });

    test('should reset and change duration after stopping timer', async ({ page }) => {
      // Start with 30 seconds
      await page.click('[data-testid="duration-30s"]');
      await page.click('[data-testid="start-focus-button"]');
      await page.waitForTimeout(1000);

      // Pause and stop
      await page.click('[data-testid="pause-button"]');
      await page.click('[data-testid="stop-button"]');
      await page.click('[data-testid="reset-timer-button"]');

      // Change to different duration
      await page.click('[data-testid="duration-5min"]');
      expect(await page.textContent('[data-testid="time-display"]')).toBe('05:00');
    });
  });

  test.describe('Display Format', () => {
    test('should display hours for durations over 60 minutes', async ({ page }) => {
      await page.click('[data-testid="custom-duration-button"]');

      await page.fill('[data-testid="custom-minutes-input"]', '75');
      await page.fill('[data-testid="custom-seconds-input"]', '30');
      await page.click('[data-testid="apply-custom-duration"]');

      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      // 75:30 = 1:15:30
      expect(timeDisplay).toMatch(/^\d{1,2}:\d{2}:\d{2}$/);
    });

    test('should maintain MM:SS format for durations under 60 minutes', async ({ page }) => {
      await page.click('[data-testid="duration-25min"]');
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toMatch(/^\d{2}:\d{2}$/);
    });
  });
});