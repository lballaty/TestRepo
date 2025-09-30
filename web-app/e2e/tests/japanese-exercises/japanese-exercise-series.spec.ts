// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/e2e/tests/japanese-exercises/japanese-exercise-series.spec.ts
// Description: Comprehensive E2E tests for Japanese longevity exercise series functionality
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { test, expect } from '@playwright/test';

test.describe('Japanese Exercise Series', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="time-display"]');

    // Open profile manager
    await page.click('[data-testid="toggle-profiles-button"]');
    await page.waitForSelector('[data-testid="profile-pomodoro"]');
  });

  test.describe('Japanese Exercise Profile Visibility', () => {
    test('should display all Japanese exercise profiles', async ({ page }) => {
      // Check for Japanese exercise profiles
      await expect(page.locator('[data-testid="profile-rajio-taiso"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-tai-chi-morning"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-shinrin-yoku"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-ikigai-reflection"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-zazen-sitting"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-longevity-walk"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-hara-hachi-bu"]')).toBeVisible();
    });

    test('should display correct Japanese icons and names', async ({ page }) => {
      // Check Rajio Taiso
      const rajioProfile = page.locator('[data-testid="profile-rajio-taiso"]');
      await expect(rajioProfile.locator('text=📻')).toBeVisible();
      await expect(rajioProfile.locator('text=Rajio Taiso')).toBeVisible();
      await expect(rajioProfile.locator('text=Japanese radio calisthenics')).toBeVisible();

      // Check Tai Chi Morning
      const taiChiProfile = page.locator('[data-testid="profile-tai-chi-morning"]');
      await expect(taiChiProfile.locator('text=🌅')).toBeVisible();
      await expect(taiChiProfile.locator('text=Tai Chi Morning')).toBeVisible();
      await expect(taiChiProfile.locator('text=Gentle flowing movements')).toBeVisible();

      // Check Shinrin-yoku
      const shinrinProfile = page.locator('[data-testid="profile-shinrin-yoku"]');
      await expect(shinrinProfile.locator('text=🌲')).toBeVisible();
      await expect(shinrinProfile.locator('text=Shinrin-yoku')).toBeVisible();
      await expect(shinrinProfile.locator('text=Forest bathing meditation')).toBeVisible();
    });

    test('should show correct durations for Japanese exercises', async ({ page }) => {
      // Test Rajio Taiso - should be about 6 minutes
      await page.click('[data-testid="profile-rajio-taiso"]');
      let timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('06:00');

      // Test Tai Chi Morning - should be about 8 minutes
      await page.click('[data-testid="profile-tai-chi-morning"]');
      timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('08:00');

      // Test Shinrin-yoku - should be about 6 minutes
      await page.click('[data-testid="profile-shinrin-yoku"]');
      timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('06:00');
    });
  });

  test.describe('Japanese Exercise Series Integration', () => {
    test('should start Rajio Taiso series correctly', async ({ page }) => {
      // Select Rajio Taiso profile
      await page.click('[data-testid="profile-rajio-taiso"]');

      // Close profile manager and start exercise
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      // Should show exercise series indicators
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

      // Should show series name in header
      await expect(page.locator('text=Rajio Taiso')).toBeVisible();
      await expect(page.locator('text=Japanese radio calisthenics')).toBeVisible();

      // Timer should be counting down from 6 minutes
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay?.startsWith('05:')).toBeTruthy();
    });

    test('should display exercise step information during series', async ({ page }) => {
      // Select Tai Chi Morning
      await page.click('[data-testid="profile-tai-chi-morning"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      // Should show step counter or progress indicator
      // Looking for exercise step information
      await page.waitForTimeout(1000); // Wait for timer to start

      // Check that timer is actively running
      const pauseButton = page.locator('[data-testid="pause-button"]');
      await expect(pauseButton).toBeVisible();

      // Verify header shows exercise name
      await expect(page.locator('text=Tai Chi Morning')).toBeVisible();
    });

    test('should handle exercise pause and resume', async ({ page }) => {
      // Start Shinrin-yoku
      await page.click('[data-testid="profile-shinrin-yoku"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      // Pause the exercise
      await page.click('[data-testid="pause-button"]');
      await expect(page.locator('[data-testid="resume-button"]')).toBeVisible();

      // Resume the exercise
      await page.click('[data-testid="resume-button"]');
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();
    });

    test('should stop exercise series correctly', async ({ page }) => {
      // Start Ikigai Reflection
      await page.click('[data-testid="profile-ikigai-reflection"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      // Stop the exercise
      await page.click('[data-testid="stop-button"]');

      // Should return to timer setup state
      await expect(page.locator('[data-testid="start-focus-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="pause-button"]')).not.toBeVisible();
    });
  });

  test.describe('Japanese Exercise Profile Selection', () => {
    test('should select and remember Japanese exercise profiles', async ({ page }) => {
      // Select Zazen Sitting
      await page.click('[data-testid="profile-zazen-sitting"]');

      // Verify selection
      const zazenProfile = page.locator('[data-testid="profile-zazen-sitting"]');
      await expect(zazenProfile).toHaveClass(/border-blue-500/);

      // Check timer shows correct duration (15 minutes)
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('15:00');

      // Reload page to test persistence
      await page.reload();
      await page.waitForSelector('[data-testid="time-display"]');

      // Should remember Zazen selection
      const timeAfterReload = await page.textContent('[data-testid="time-display"]');
      expect(timeAfterReload).toBe('15:00');
    });

    test('should handle rapid profile switching between Japanese exercises', async ({ page }) => {
      // Rapidly switch between Japanese exercises
      await page.click('[data-testid="profile-rajio-taiso"]');
      await page.waitForTimeout(100);

      await page.click('[data-testid="profile-tai-chi-morning"]');
      await page.waitForTimeout(100);

      await page.click('[data-testid="profile-longevity-walk"]');

      // Should end with Longevity Walk selected (20 minutes)
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('20:00');

      const walkProfile = page.locator('[data-testid="profile-longevity-walk"]');
      await expect(walkProfile).toHaveClass(/border-blue-500/);
    });
  });

  test.describe('Japanese Exercise Visual Elements', () => {
    test('should display Japanese-themed colors correctly', async ({ page }) => {
      // Check for Japanese-inspired color schemes
      const rajioProfile = page.locator('[data-testid="profile-rajio-taiso"]');
      // Should have red color scheme (dc2626)
      await expect(rajioProfile).toHaveCSS('background-color', /rgb\(220, 38, 38\)|rgb\(252, 226, 226\)/);

      const taiChiProfile = page.locator('[data-testid="profile-tai-chi-morning"]');
      // Should have orange color scheme (ea580c)
      await expect(taiChiProfile).toHaveCSS('background-color', /rgb\(234, 88, 12\)|rgb\(254, 235, 218\)/);
    });

    test('should show Japanese exercise descriptions', async ({ page }) => {
      // Verify descriptions contain Japanese cultural context
      await expect(page.locator('text=Traditional Japanese radio calisthenics')).toBeVisible();
      await expect(page.locator('text=Forest bathing meditation')).toBeVisible();
      await expect(page.locator('text=Purpose and meaning contemplation')).toBeVisible();
      await expect(page.locator('text=Seated Zen meditation')).toBeVisible();
      await expect(page.locator('text=Mindful eating meditation')).toBeVisible();
    });
  });

  test.describe('Japanese Exercise Accessibility', () => {
    test('should support keyboard navigation for Japanese profiles', async ({ page }) => {
      // Focus on first Japanese profile and navigate with keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // Navigate to profiles area

      // Use arrow keys to navigate between Japanese profiles
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown'); // Should be on Rajio Taiso

      // Press Enter to select
      await page.keyboard.press('Enter');

      // Verify Rajio Taiso was selected
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('06:00');
    });

    test('should have proper ARIA labels for Japanese exercises', async ({ page }) => {
      // Check ARIA accessibility for Japanese profiles
      const rajioProfile = page.locator('[data-testid="profile-rajio-taiso"]');
      await expect(rajioProfile).toHaveAttribute('role', 'button');
      await expect(rajioProfile).toHaveAttribute('aria-label', /Rajio Taiso.*6 minutes/);

      const shinrinProfile = page.locator('[data-testid="profile-shinrin-yoku"]');
      await expect(shinrinProfile).toHaveAttribute('aria-label', /Shinrin-yoku.*6 minutes/);
    });
  });

  test.describe('Japanese Exercise Mobile Compatibility', () => {
    test('should work correctly on mobile viewports', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Reload to ensure mobile layout
      await page.reload();
      await page.waitForSelector('[data-testid="time-display"]');

      // Open profiles on mobile
      await page.click('[data-testid="toggle-profiles-button"]');

      // Japanese profiles should be visible and selectable on mobile
      await expect(page.locator('[data-testid="profile-rajio-taiso"]')).toBeVisible();
      await page.click('[data-testid="profile-rajio-taiso"]');

      // Timer should update on mobile
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('06:00');
    });

    test('should handle touch interactions for Japanese exercises', async ({ page }) => {
      // Set mobile viewport for touch testing
      await page.setViewportSize({ width: 414, height: 896 });
      await page.reload();
      await page.waitForSelector('[data-testid="time-display"]');

      await page.click('[data-testid="toggle-profiles-button"]');

      // Test touch selection of Japanese exercise
      await page.tap('[data-testid="profile-tai-chi-morning"]');

      // Should select Tai Chi Morning
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('08:00');
    });
  });
});