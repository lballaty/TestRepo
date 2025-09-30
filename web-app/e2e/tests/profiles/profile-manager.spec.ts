// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/e2e/tests/profiles/profile-manager.spec.ts
// Description: E2E tests for Profile Manager UI functionality
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { test, expect } from '@playwright/test';

test.describe('Profile Manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="time-display"]');

    // Open profile manager
    await page.click('[data-testid="toggle-profiles-button"]');
    await page.waitForSelector('[data-testid="profile-pomodoro"]');
  });

  test.describe('Default Profiles', () => {
    test('should display default profiles', async ({ page }) => {
      // Check for default profiles
      await expect(page.locator('[data-testid="profile-pomodoro"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-deep-work"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-exercise"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-meditation"]')).toBeVisible();
    });

    test('should select Pomodoro profile and update timer', async ({ page }) => {
      await page.click('[data-testid="profile-pomodoro"]');

      // Check timer updated to 25 minutes
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('25:00');

      // Check profile is selected
      const pomodoroProfile = page.locator('[data-testid="profile-pomodoro"]');
      await expect(pomodoroProfile).toHaveClass(/border-blue-500/);
    });

    test('should select Exercise profile for 30-second intervals', async ({ page }) => {
      await page.click('[data-testid="profile-exercise"]');

      // Check timer updated to 30 seconds
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('00:30');
    });

    test('should select Deep Work profile for 90 minutes', async ({ page }) => {
      await page.click('[data-testid="profile-deep-work"]');

      // Check timer updated to 90 minutes (displayed as 01:30:00)
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('01:30:00');
    });

    test('should not allow deleting default profiles', async ({ page }) => {
      // Default profiles should not have delete buttons at all
      const pomodoroProfile = page.locator('[data-testid="profile-pomodoro"]');
      const deleteButton = pomodoroProfile.locator('button:has-text("Delete")');
      await expect(deleteButton).not.toBeVisible();
    });
  });

  test.describe('Profile Creation', () => {
    test('should open profile creation form', async ({ page }) => {
      await page.click('[data-testid="add-profile-button"]');

      // Check form is visible
      await expect(page.locator('text=Create New Profile')).toBeVisible();
      await expect(page.locator('[data-testid="profile-name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-description-input"]')).toBeVisible();
    });

    test('should create a new custom profile', async ({ page }) => {
      await page.click('[data-testid="add-profile-button"]');

      // Fill out form
      await page.fill('[data-testid="profile-name-input"]', 'Study Session');
      await page.fill('[data-testid="profile-description-input"]', 'Long focused study periods');
      await page.fill('[data-testid="profile-minutes-input"]', '45');
      await page.fill('[data-testid="profile-seconds-input"]', '0');
      await page.fill('[data-testid="break-minutes-input"]', '10');
      await page.fill('[data-testid="break-seconds-input"]', '0');

      // Select icon and color
      await page.click('[data-testid="icon-📚"]');
      await page.click('[data-testid="color-#8b5cf6"]');

      // Create profile
      await page.click('[data-testid="save-profile-button"]');

      // Check profile was created and selected (look for it in the profile card specifically)
      await expect(page.locator('[data-testid*="profile-custom-"] h3:has-text("Study Session")')).toBeVisible();
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('45:00');
    });

    test('should create exercise interval profile with seconds', async ({ page }) => {
      await page.click('[data-testid="add-profile-button"]');

      // Fill out form for 45-second intervals
      await page.fill('[data-testid="profile-name-input"]', 'HIIT Training');
      await page.fill('[data-testid="profile-description-input"]', 'High intensity interval training');
      await page.fill('[data-testid="profile-minutes-input"]', '0');
      await page.fill('[data-testid="profile-seconds-input"]', '45');
      await page.fill('[data-testid="break-minutes-input"]', '0');
      await page.fill('[data-testid="break-seconds-input"]', '15');

      await page.click('[data-testid="icon-💪"]');
      await page.click('[data-testid="save-profile-button"]');

      // Check timer shows 45 seconds
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('00:45');
    });

    test('should validate form inputs', async ({ page }) => {
      await page.click('[data-testid="add-profile-button"]');

      // Try to save without name
      const saveButton = page.locator('[data-testid="save-profile-button"]');
      await expect(saveButton).toBeDisabled();

      // Add name and verify button becomes enabled
      await page.fill('[data-testid="profile-name-input"]', 'Test Profile');
      await expect(saveButton).toBeEnabled();
    });

    test('should limit seconds input to 59', async ({ page }) => {
      await page.click('[data-testid="add-profile-button"]');

      // Try to enter 99 seconds
      await page.fill('[data-testid="profile-seconds-input"]', '99');
      await page.fill('[data-testid="profile-name-input"]', 'Test');
      await page.click('[data-testid="save-profile-button"]');

      // Should be capped at 59 seconds
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('25:59'); // Default 25 minutes + capped 59 seconds
    });

    test('should cancel profile creation', async ({ page }) => {
      await page.click('[data-testid="add-profile-button"]');
      await page.fill('[data-testid="profile-name-input"]', 'Test Profile');

      // Cancel
      await page.click('[data-testid="cancel-profile-button"]');

      // Form should be closed, profile not created
      await expect(page.locator('text=Create New Profile')).not.toBeVisible();
      await expect(page.locator('text=Test Profile')).not.toBeVisible();
    });
  });

  test.describe('Profile Editing', () => {
    test('should edit a custom profile', async ({ page }) => {
      // First create a custom profile
      await page.click('[data-testid="add-profile-button"]');
      await page.fill('[data-testid="profile-name-input"]', 'Original Name');
      await page.fill('[data-testid="profile-description-input"]', 'Original description');
      await page.fill('[data-testid="profile-minutes-input"]', '20');
      await page.click('[data-testid="save-profile-button"]');

      // Edit the profile
      await page.click('[data-testid="edit-profile-button"]');

      // Update form
      await page.fill('[data-testid="profile-name-input"]', 'Updated Name');
      await page.fill('[data-testid="profile-description-input"]', 'Updated description');
      await page.fill('[data-testid="profile-minutes-input"]', '30');
      await page.click('[data-testid="save-profile-button"]');

      // Check updates (look in the profile card specifically)
      await expect(page.locator('[data-testid*="profile-custom-"] h3:has-text("Updated Name")')).toBeVisible();
      await expect(page.locator('[data-testid*="profile-custom-"] p:has-text("Updated description")')).toBeVisible();
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('30:00');
    });

    test('should show edit button only for selected profile', async ({ page }) => {
      // Edit button should not be visible initially
      await expect(page.locator('[data-testid="edit-profile-button"]')).not.toBeVisible();

      // Select a profile
      await page.click('[data-testid="profile-pomodoro"]');

      // Edit button should appear
      await expect(page.locator('[data-testid="edit-profile-button"]')).toBeVisible();
    });
  });

  test.describe('Profile Deletion', () => {
    test('should delete a custom profile', async ({ page }) => {
      // Create a custom profile
      await page.click('[data-testid="add-profile-button"]');
      await page.fill('[data-testid="profile-name-input"]', 'To Delete');
      await page.click('[data-testid="save-profile-button"]');

      // Delete the profile (find the delete button within the custom profile)
      const customProfile = page.locator('[data-testid*="profile-custom-"]:has-text("To Delete")');
      await customProfile.locator('button:has-text("Delete")').click();

      // Profile should be gone
      await expect(page.locator('text=To Delete')).not.toBeVisible();
    });

    test('should select default profile after deleting selected custom profile', async ({ page }) => {
      // Create and select a custom profile
      await page.click('[data-testid="add-profile-button"]');
      await page.fill('[data-testid="profile-name-input"]', 'Temporary');
      await page.fill('[data-testid="profile-minutes-input"]', '15');
      await page.click('[data-testid="save-profile-button"]');

      // Verify it's selected (15 minutes)
      let timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('15:00');

      // Delete the profile (find the delete button within the custom profile)
      const customProfile2 = page.locator('[data-testid*="profile-custom-"]:has-text("Temporary")');
      await customProfile2.locator('button:has-text("Delete")').click();

      // Should fall back to default Pomodoro (25 minutes)
      timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('25:00');
    });
  });

  test.describe('Profile Persistence', () => {
    test('should persist custom profiles across page reloads', async ({ page }) => {
      // Create a custom profile
      await page.click('[data-testid="add-profile-button"]');
      await page.fill('[data-testid="profile-name-input"]', 'Persistent Profile');
      await page.fill('[data-testid="profile-description-input"]', 'Should survive reload');
      await page.click('[data-testid="save-profile-button"]');

      // Reload page
      await page.reload();
      await page.waitForSelector('[data-testid="time-display"]');
      await page.click('[data-testid="toggle-profiles-button"]');

      // Profile should still exist (look in profile cards specifically)
      await expect(page.locator('[data-testid*="profile-custom-"] h3:has-text("Persistent Profile")')).toBeVisible();
      await expect(page.locator('[data-testid*="profile-custom-"] p:has-text("Should survive reload")')).toBeVisible();
    });

    test('should remember last selected profile', async ({ page }) => {
      // Select Deep Work profile
      await page.click('[data-testid="profile-deep-work"]');

      // Wait for timer to update to confirm selection worked
      await page.waitForFunction(() => {
        const display = document.querySelector('[data-testid="time-display"]');
        return display?.textContent === '01:30:00';
      });

      // Verify localStorage has the selection
      const savedProfileId = await page.evaluate(() => {
        return localStorage.getItem('lastSelectedProfile');
      });
      expect(savedProfileId).toBe('deep-work');

      // Reload page
      await page.reload();
      await page.waitForSelector('[data-testid="time-display"]');

      // Wait longer for Safari and mobile browsers
      await page.waitForTimeout(2000);

      // Check what profile is actually saved after reload
      const profileAfterReload = await page.evaluate(() => {
        return localStorage.getItem('lastSelectedProfile');
      });
      console.log('Profile after reload:', profileAfterReload);

      // Should still show Deep Work duration
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      console.log('Time display after reload:', timeDisplay);
      expect(timeDisplay).toBe('01:30:00');
    });
  });

  test.describe('Profile Integration with Timer', () => {
    test('should use profile settings when starting timer', async ({ page }) => {
      // Select exercise profile (30 seconds)
      await page.click('[data-testid="profile-exercise"]');

      // Close profile manager and start timer
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      // Timer should be running with 30 seconds
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

      // Wait a bit and check countdown
      await page.waitForTimeout(1000);
      const timeDisplay = await page.textContent('[data-testid="time-display"]');
      const seconds = parseInt(timeDisplay!.split(':')[1]);
      expect(seconds).toBeLessThanOrEqual(29);
    });

    test('should show profile name in timer header', async ({ page }) => {
      // Select meditation profile
      await page.click('[data-testid="profile-meditation"]');

      // Close profile manager
      await page.click('[data-testid="toggle-profiles-button"]');

      // Check header shows profile name
      await expect(page.locator('text=Meditation')).toBeVisible();
      await expect(page.locator('text=10-minute mindfulness sessions')).toBeVisible();
    });
  });

  test.describe('Profile Visual Elements', () => {
    test('should display profile icons and colors', async ({ page }) => {
      // Check default profile icons are visible
      const pomodoroProfile = page.locator('[data-testid="profile-pomodoro"]');
      await expect(pomodoroProfile.locator('text=🍅')).toBeVisible();

      const exerciseProfile = page.locator('[data-testid="profile-exercise"]');
      await expect(exerciseProfile.locator('text=💪')).toBeVisible();
    });

    test('should allow selecting different icons and colors', async ({ page }) => {
      await page.click('[data-testid="add-profile-button"]');

      // Test icon selection
      await page.click('[data-testid="icon-🧠"]');
      await page.click('[data-testid="icon-☕"]');

      // Test color selection
      await page.click('[data-testid="color-#ef4444"]');
      await page.click('[data-testid="color-#10b981"]');

      // Verify selections are visually indicated
      const selectedIcon = page.locator('[data-testid="icon-☕"]');
      await expect(selectedIcon).toHaveClass(/border-blue-500/);

      const selectedColor = page.locator('[data-testid="color-#10b981"]');
      await expect(selectedColor).toHaveClass(/border-gray-800/);
    });
  });
});