// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/e2e/tests/ui-enhancements/enhanced-profile-ui.spec.ts
// Description: E2E tests for enhanced profile management UI with clear time field labels
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { test, expect } from '@playwright/test';

test.describe('Enhanced Profile Management UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="time-display"]');

    // Open profile manager
    await page.click('[data-testid="toggle-profiles-button"]');
    await page.waitForSelector('[data-testid="profile-pomodoro"]');
  });

  test.describe('Time Field Labels and Clarity', () => {
    test('should display clear Minutes and Seconds labels', async ({ page }) => {
      // Open profile creation form
      await page.click('[data-testid="add-profile-button"]');

      // Check for clear time field labels
      await expect(page.locator('label:has-text("Minutes")')).toBeVisible();
      await expect(page.locator('label:has-text("Seconds")')).toBeVisible();

      // Should show labels for both duration and break fields
      await expect(page.locator('text=Duration (Minutes)')).toBeVisible();
      await expect(page.locator('text=Duration (Seconds)')).toBeVisible();
      await expect(page.locator('text=Break (Minutes)')).toBeVisible();
      await expect(page.locator('text=Break (Seconds)')).toBeVisible();
    });

    test('should have proper field grouping for time inputs', async ({ page }) => {
      await page.click('[data-testid="add-profile-button"]');

      // Duration fields should be grouped together
      const durationGroup = page.locator('[data-testid="duration-group"]');
      await expect(durationGroup).toBeVisible();
      await expect(durationGroup.locator('[data-testid="profile-minutes-input"]')).toBeVisible();
      await expect(durationGroup.locator('[data-testid="profile-seconds-input"]')).toBeVisible();

      // Break fields should be grouped together
      const breakGroup = page.locator('[data-testid="break-group"]');
      await expect(breakGroup).toBeVisible();
      await expect(breakGroup.locator('[data-testid="break-minutes-input"]')).toBeVisible();
      await expect(breakGroup.locator('[data-testid="break-seconds-input"]')).toBeVisible();
    });

    test('should show input placeholders with units', async ({ page }) => {
      await page.click('[data-testid="add-profile-button"]');

      // Check placeholders contain unit information
      const minutesInput = page.locator('[data-testid="profile-minutes-input"]');
      const minutesPlaceholder = await minutesInput.getAttribute('placeholder');
      expect(minutesPlaceholder).toMatch(/minutes?|min/i);

      const secondsInput = page.locator('[data-testid="profile-seconds-input"]');
      const secondsPlaceholder = await secondsInput.getAttribute('placeholder');
      expect(secondsPlaceholder).toMatch(/seconds?|sec/i);
    });

    test('should validate time input ranges with clear feedback', async ({ page }) => {
      await page.click('[data-testid="add-profile-button"]');

      // Fill form with valid name first
      await page.fill('[data-testid="profile-name-input"]', 'Test Profile');

      // Test seconds validation (should cap at 59)
      await page.fill('[data-testid="profile-seconds-input"]', '75');
      await page.fill('[data-testid="break-seconds-input"]', '90');

      // Should show validation messages
      const secondsValidation = page.locator('[data-testid="seconds-validation"]');
      await expect(secondsValidation).toBeVisible();
      await expect(secondsValidation).toHaveText(/seconds must be between 0 and 59/i);

      // Test minutes validation for reasonable ranges
      await page.fill('[data-testid="profile-minutes-input"]', '999');
      const minutesValidation = page.locator('[data-testid="minutes-validation"]');
      await expect(minutesValidation).toBeVisible();
    });

    test('should format time display consistently across the app', async ({ page }) => {
      // Create profile with specific time
      await page.click('[data-testid="add-profile-button"]');
      await page.fill('[data-testid="profile-name-input"]', 'Format Test');
      await page.fill('[data-testid="profile-minutes-input"]', '5');
      await page.fill('[data-testid="profile-seconds-input"]', '30');
      await page.click('[data-testid="save-profile-button"]');

      // Check time display shows proper format
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('05:30');

      // Check profile card shows duration info
      const profileCard = page.locator('[data-testid*="profile-custom-"]:has-text("Format Test")');
      await expect(profileCard).toContainText('5 min 30 sec');
    });
  });

  test.describe('Enhanced Form Usability', () => {
    test('should support tab navigation through time fields', async ({ page }) => {
      await page.click('[data-testid="add-profile-button"]');

      // Start from name field and tab through time inputs
      await page.click('[data-testid="profile-name-input"]');
      await page.keyboard.press('Tab'); // to description
      await page.keyboard.press('Tab'); // to minutes

      // Should focus on minutes input
      const minutesInput = page.locator('[data-testid="profile-minutes-input"]');
      await expect(minutesInput).toBeFocused();

      await page.keyboard.press('Tab'); // to seconds
      const secondsInput = page.locator('[data-testid="profile-seconds-input"]');
      await expect(secondsInput).toBeFocused();

      await page.keyboard.press('Tab'); // to break minutes
      const breakMinutesInput = page.locator('[data-testid="break-minutes-input"]');
      await expect(breakMinutesInput).toBeFocused();
    });

    test('should auto-calculate and display total duration', async ({ page }) => {
      await page.click('[data-testid="add-profile-button"]');

      // Fill in time values
      await page.fill('[data-testid="profile-minutes-input"]', '3');
      await page.fill('[data-testid="profile-seconds-input"]', '45');

      // Should show calculated total duration
      const totalDuration = page.locator('[data-testid="total-duration"]');
      await expect(totalDuration).toBeVisible();
      await expect(totalDuration).toHaveText('Total: 3:45');

      // Update values and check recalculation
      await page.fill('[data-testid="profile-minutes-input"]', '10');
      await page.fill('[data-testid="profile-seconds-input"]', '15');
      await expect(totalDuration).toHaveText('Total: 10:15');
    });

    test('should provide helpful input hints and examples', async ({ page }) => {
      await page.click('[data-testid="add-profile-button"]');

      // Should show helpful hints near time inputs
      await expect(page.locator('text=Recommended: 25-90 minutes for focus')).toBeVisible();
      await expect(page.locator('text=Break: 5-15 minutes typical')).toBeVisible();

      // Should show examples for different profile types
      const examplesSection = page.locator('[data-testid="time-examples"]');
      await expect(examplesSection).toBeVisible();
      await expect(examplesSection).toContainText('Pomodoro: 25 min');
      await expect(examplesSection).toContainText('Deep Work: 90 min');
      await expect(examplesSection).toContainText('Exercise: 30 sec - 5 min');
    });

    test('should handle rapid input changes smoothly', async ({ page }) => {
      await page.click('[data-testid="add-profile-button"]');
      await page.fill('[data-testid="profile-name-input"]', 'Rapid Input Test');

      // Rapidly change values
      for (let i = 0; i < 10; i++) {
        await page.fill('[data-testid="profile-minutes-input"]', `${i + 1}`);
        await page.fill('[data-testid="profile-seconds-input"]', `${i * 5}`);
        await page.waitForTimeout(100);
      }

      // Form should still be responsive
      const saveButton = page.locator('[data-testid="save-profile-button"]');
      await expect(saveButton).toBeEnabled();

      // Final values should be correct
      const minutesValue = await page.inputValue('[data-testid="profile-minutes-input"]');
      const secondsValue = await page.inputValue('[data-testid="profile-seconds-input"]');
      expect(minutesValue).toBe('10');
      expect(secondsValue).toBe('45');
    });
  });

  test.describe('LiveLong Branding Integration', () => {
    test('should display LiveLong ⊹ branding consistently', async ({ page }) => {
      // Check main timer header
      await expect(page.locator('text=LiveLong ⊹')).toBeVisible();

      // Check profile manager title
      await expect(page.locator('h2:has-text("Timer Profiles")')).toBeVisible();

      // Open creation form and check branding there too
      await page.click('[data-testid="add-profile-button"]');
      await expect(page.locator('h3:has-text("Create New Profile")')).toBeVisible();
    });

    test('should show Japanese cultural elements in default profiles', async ({ page }) => {
      // Check for Japanese exercise profiles with cultural context
      const rajioProfile = page.locator('[data-testid="profile-rajio-taiso"]');
      await expect(rajioProfile).toBeVisible();
      await expect(rajioProfile).toContainText('Traditional Japanese radio calisthenics');

      const shinrinProfile = page.locator('[data-testid="profile-shinrin-yoku"]');
      await expect(shinrinProfile).toBeVisible();
      await expect(shinrinProfile).toContainText('Forest bathing meditation');

      // Should show proper Japanese terminology
      await expect(page.locator('text=Ikigai')).toBeVisible();
      await expect(page.locator('text=Zazen')).toBeVisible();
      await expect(page.locator('text=Hara Hachi Bu')).toBeVisible();
    });

    test('should use consistent Asian-inspired color palette', async ({ page }) => {
      // Check that Japanese profiles use appropriate colors
      const rajioProfile = page.locator('[data-testid="profile-rajio-taiso"]');
      const rajioColor = await rajioProfile.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      // Should use red color scheme (dc2626 or similar)
      expect(rajioColor).toMatch(/rgb\(220, 38, 38\)|rgb\(252, 226, 226\)/);

      const taiChiProfile = page.locator('[data-testid="profile-tai-chi-morning"]');
      const taiChiColor = await taiChiProfile.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      // Should use orange color scheme (ea580c or similar)
      expect(taiChiColor).toMatch(/rgb\(234, 88, 12\)|rgb\(254, 235, 218\)/);
    });
  });

  test.describe('Profile Form Validation Enhancements', () => {
    test('should provide real-time validation feedback', async ({ page }) => {
      await page.click('[data-testid="add-profile-button"]');

      // Initially save button should be disabled
      const saveButton = page.locator('[data-testid="save-profile-button"]');
      await expect(saveButton).toBeDisabled();

      // Add name - button should become enabled
      await page.fill('[data-testid="profile-name-input"]', 'Test');
      await expect(saveButton).toBeEnabled();

      // Clear name - button should become disabled again
      await page.fill('[data-testid="profile-name-input"]', '');
      await expect(saveButton).toBeDisabled();

      // Add name back
      await page.fill('[data-testid="profile-name-input"]', 'Valid Name');
      await expect(saveButton).toBeEnabled();
    });

    test('should validate time combinations for practical use', async ({ page }) => {
      await page.click('[data-testid="add-profile-button"]');
      await page.fill('[data-testid="profile-name-input"]', 'Validation Test');

      // Test very short duration (less than 10 seconds)
      await page.fill('[data-testid="profile-minutes-input"]', '0');
      await page.fill('[data-testid="profile-seconds-input"]', '5');

      // Should show warning about very short duration
      const shortDurationWarning = page.locator('[data-testid="short-duration-warning"]');
      await expect(shortDurationWarning).toBeVisible();
      await expect(shortDurationWarning).toContainText('Very short sessions may not be effective');

      // Test break longer than session
      await page.fill('[data-testid="profile-minutes-input"]', '5');
      await page.fill('[data-testid="break-minutes-input"]', '10');

      const breakWarning = page.locator('[data-testid="break-too-long-warning"]');
      await expect(breakWarning).toBeVisible();
      await expect(breakWarning).toContainText('Break is longer than session');
    });

    test('should suggest appropriate defaults based on profile type', async ({ page }) => {
      await page.click('[data-testid="add-profile-button"]');

      // When user types "pomodoro" in name, should suggest 25 minutes
      await page.fill('[data-testid="profile-name-input"]', 'My Pomodoro');

      const suggestions = page.locator('[data-testid="default-suggestions"]');
      await expect(suggestions).toBeVisible();
      await expect(suggestions).toContainText('Suggested: 25 min work, 5 min break');

      // When user types "exercise", should suggest shorter intervals
      await page.fill('[data-testid="profile-name-input"]', 'Exercise Session');
      await expect(suggestions).toContainText('Suggested: 30 sec - 5 min intervals');
    });
  });

  test.describe('Mobile UI Enhancements', () => {
    test('should adapt time input layout for mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForSelector('[data-testid="time-display"]');

      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="add-profile-button"]');

      // Time inputs should stack vertically on mobile
      const durationGroup = page.locator('[data-testid="duration-group"]');
      const groupStyle = await durationGroup.evaluate(el =>
        window.getComputedStyle(el).flexDirection
      );
      expect(groupStyle).toBe('column');

      // Input labels should be larger on mobile
      const minutesLabel = page.locator('label:has-text("Minutes")');
      const labelFontSize = await minutesLabel.evaluate(el =>
        window.getComputedStyle(el).fontSize
      );
      expect(parseInt(labelFontSize)).toBeGreaterThan(14);
    });

    test('should provide touch-friendly time input controls', async ({ page }) => {
      await page.setViewportSize({ width: 414, height: 896 });
      await page.reload();
      await page.waitForSelector('[data-testid="time-display"]');

      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="add-profile-button"]');

      // Should have increment/decrement buttons for mobile
      const minutesIncrement = page.locator('[data-testid="minutes-increment"]');
      const minutesDecrement = page.locator('[data-testid="minutes-decrement"]');

      await expect(minutesIncrement).toBeVisible();
      await expect(minutesDecrement).toBeVisible();

      // Test increment functionality
      await page.tap('[data-testid="minutes-increment"]');
      const minutesValue = await page.inputValue('[data-testid="profile-minutes-input"]');
      expect(parseInt(minutesValue)).toBeGreaterThan(0);
    });

    test('should handle mobile keyboard input gracefully', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForSelector('[data-testid="time-display"]');

      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="add-profile-button"]');

      // Focus on time input should bring up numeric keyboard
      const minutesInput = page.locator('[data-testid="profile-minutes-input"]');
      await minutesInput.focus();

      // Input should have proper inputmode for mobile
      const inputMode = await minutesInput.getAttribute('inputmode');
      expect(inputMode).toBe('numeric');

      // Pattern should restrict to numbers
      const pattern = await minutesInput.getAttribute('pattern');
      expect(pattern).toBe('[0-9]*');
    });
  });
});