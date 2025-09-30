// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/e2e/tests/breathing/breathing-visualizer.spec.ts
// Description: Comprehensive E2E tests for breathing visualizer and all breathing patterns
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { test, expect } from '@playwright/test';

test.describe('Breathing Visualizer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="time-display"]');

    // Open profile manager
    await page.click('[data-testid="toggle-profiles-button"]');
    await page.waitForSelector('[data-testid="profile-pomodoro"]');
  });

  test.describe('Breathing Profile Visibility', () => {
    test('should display all breathing pattern profiles', async ({ page }) => {
      // Check for breathing profiles
      await expect(page.locator('[data-testid="profile-box-breathing"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-4-7-8-breathing"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-deep-breathing"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-wim-hof-breathing"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-sama-vritti"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-pranayama-breathing"]')).toBeVisible();
    });

    test('should display correct breathing icons and descriptions', async ({ page }) => {
      // Check Box Breathing
      const boxProfile = page.locator('[data-testid="profile-box-breathing"]');
      await expect(boxProfile.locator('text=⬜')).toBeVisible();
      await expect(boxProfile.locator('text=Box Breathing')).toBeVisible();
      await expect(boxProfile.locator('text=Navy SEAL technique')).toBeVisible();

      // Check 4-7-8 Breathing
      const breathing478Profile = page.locator('[data-testid="profile-4-7-8-breathing"]');
      await expect(breathing478Profile.locator('text=🌙')).toBeVisible();
      await expect(breathing478Profile.locator('text=4-7-8 Breathing')).toBeVisible();
      await expect(breathing478Profile.locator('text=Natural tranquilizer')).toBeVisible();

      // Check Deep Breathing
      const deepProfile = page.locator('[data-testid="profile-deep-breathing"]');
      await expect(deepProfile.locator('text=🫁')).toBeVisible();
      await expect(deepProfile.locator('text=Deep Breathing')).toBeVisible();
      await expect(deepProfile.locator('text=Simple stress relief')).toBeVisible();
    });

    test('should show correct durations for breathing patterns', async ({ page }) => {
      // Test Box Breathing - should be about 5.3 minutes
      await page.click('[data-testid="profile-box-breathing"]');
      let timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('05:18'); // 5.3 minutes = 5:18

      // Test 4-7-8 Breathing - should be about 4 minutes
      await page.click('[data-testid="profile-4-7-8-breathing"]');
      timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('04:00');

      // Test Deep Breathing - should be about 3 minutes
      await page.click('[data-testid="profile-deep-breathing"]');
      timeDisplay = await page.textContent('[data-testid="time-display"]');
      expect(timeDisplay).toBe('03:00');
    });
  });

  test.describe('Breathing Visualizer Launch', () => {
    test('should launch full-screen breathing visualizer for Box Breathing', async ({ page }) => {
      // Select Box Breathing profile
      await page.click('[data-testid="profile-box-breathing"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      // Should launch breathing visualizer
      await page.waitForSelector('[data-testid="breathing-visualizer"]', { timeout: 10000 });
      await expect(page.locator('[data-testid="breathing-visualizer"]')).toBeVisible();

      // Should show breathing instruction text
      const instructionText = page.locator('[data-testid="breathing-instruction"]');
      await expect(instructionText).toBeVisible();

      // Should start with "Breathe In" or preparation
      const instruction = await instructionText.textContent();
      expect(instruction).toMatch(/(Breathe In|Inhale|Prepare|Get Ready)/);
    });

    test('should display breathing phases correctly', async ({ page }) => {
      // Start 4-7-8 breathing
      await page.click('[data-testid="profile-4-7-8-breathing"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      await page.waitForSelector('[data-testid="breathing-visualizer"]');

      // Wait for breathing phases to cycle
      await page.waitForTimeout(2000);

      // Check that instruction text changes
      const instructionText = page.locator('[data-testid="breathing-instruction"]');
      const instruction = await instructionText.textContent();

      // Should show one of the breathing phases
      expect(instruction).toMatch(/(Breathe In|Hold|Breathe Out|Exhale|Inhale)/);
    });

    test('should show breathing timer and cycle counter', async ({ page }) => {
      // Start Deep Breathing
      await page.click('[data-testid="profile-deep-breathing"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      await page.waitForSelector('[data-testid="breathing-visualizer"]');

      // Should show cycle counter
      const cycleCounter = page.locator('[data-testid="cycle-counter"]');
      await expect(cycleCounter).toBeVisible();

      // Should show breathing timer
      const breathingTimer = page.locator('[data-testid="breathing-timer"]');
      await expect(breathingTimer).toBeVisible();
    });
  });

  test.describe('Breathing Visualizer Interactions', () => {
    test('should pause and resume breathing visualizer', async ({ page }) => {
      // Start Wim Hof breathing
      await page.click('[data-testid="profile-wim-hof-breathing"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      await page.waitForSelector('[data-testid="breathing-visualizer"]');

      // Pause breathing
      await page.click('[data-testid="pause-button"]');

      // Should show pause state
      await expect(page.locator('[data-testid="resume-button"]')).toBeVisible();

      // Resume breathing
      await page.click('[data-testid="resume-button"]');

      // Should return to breathing state
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();
    });

    test('should exit breathing visualizer correctly', async ({ page }) => {
      // Start Sama Vritti breathing
      await page.click('[data-testid="profile-sama-vritti"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      await page.waitForSelector('[data-testid="breathing-visualizer"]');

      // Stop breathing session
      await page.click('[data-testid="stop-button"]');

      // Should exit visualizer and return to timer
      await expect(page.locator('[data-testid="breathing-visualizer"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="start-focus-button"]')).toBeVisible();
    });

    test('should handle keyboard controls in breathing visualizer', async ({ page }) => {
      // Start Pranayama breathing
      await page.click('[data-testid="profile-pranayama-breathing"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      await page.waitForSelector('[data-testid="breathing-visualizer"]');

      // Test spacebar pause/resume
      await page.keyboard.press('Space');
      await expect(page.locator('[data-testid="resume-button"]')).toBeVisible();

      await page.keyboard.press('Space');
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

      // Test Escape to exit
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="breathing-visualizer"]')).not.toBeVisible();
    });
  });

  test.describe('Breathing Background Animations', () => {
    test('should display background breathing animation', async ({ page }) => {
      // Start Box Breathing to test square animation
      await page.click('[data-testid="profile-box-breathing"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      await page.waitForSelector('[data-testid="breathing-visualizer"]');

      // Should have background animation container
      const backgroundAnimation = page.locator('[data-testid="breathing-background"]');
      await expect(backgroundAnimation).toBeVisible();

      // Should have scaling animation for breathing effect
      const animatedElement = page.locator('[data-testid="breathing-animation"]');
      await expect(animatedElement).toBeVisible();
    });

    test('should scale background elements with breathing phases', async ({ page }) => {
      // Start breathing session
      await page.click('[data-testid="profile-deep-breathing"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      await page.waitForSelector('[data-testid="breathing-visualizer"]');

      // Wait for animation to start
      await page.waitForTimeout(1000);

      // Check that background has transform scale applied
      const backgroundElement = page.locator('[data-testid="breathing-background"]');
      const transform = await backgroundElement.evaluate(el => window.getComputedStyle(el).transform);

      // Should have some scale transformation
      expect(transform).not.toBe('none');
    });

    test('should use different visual styles for different patterns', async ({ page }) => {
      // Test Box Breathing (square style)
      await page.click('[data-testid="profile-box-breathing"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      await page.waitForSelector('[data-testid="breathing-visualizer"]');

      // Should have square-themed background
      const squareBackground = page.locator('[data-testid="breathing-squares"]');
      await expect(squareBackground).toBeVisible();

      // Exit and test circle pattern
      await page.keyboard.press('Escape');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="profile-deep-breathing"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      await page.waitForSelector('[data-testid="breathing-visualizer"]');

      // Should have circle-themed background
      const circleBackground = page.locator('[data-testid="breathing-circles"]');
      await expect(circleBackground).toBeVisible();
    });
  });

  test.describe('Breathing Pattern Accuracy', () => {
    test('should follow Box Breathing 4-4-4-4 pattern', async ({ page }) => {
      await page.click('[data-testid="profile-box-breathing"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      await page.waitForSelector('[data-testid="breathing-visualizer"]');

      // Wait for first phase
      await page.waitForTimeout(1000);

      // Should show Inhale for ~4 seconds
      const instruction = page.locator('[data-testid="breathing-instruction"]');
      let text = await instruction.textContent();
      expect(text).toMatch(/(Breathe In|Inhale)/);

      // Wait for hold phase
      await page.waitForTimeout(4500);
      text = await instruction.textContent();
      expect(text).toMatch(/Hold/);

      // Wait for exhale phase
      await page.waitForTimeout(4500);
      text = await instruction.textContent();
      expect(text).toMatch(/(Breathe Out|Exhale)/);
    });

    test('should follow 4-7-8 breathing pattern correctly', async ({ page }) => {
      await page.click('[data-testid="profile-4-7-8-breathing"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      await page.waitForSelector('[data-testid="breathing-visualizer"]');

      // Start with inhale (4 seconds)
      await page.waitForTimeout(1000);
      const instruction = page.locator('[data-testid="breathing-instruction"]');
      let text = await instruction.textContent();
      expect(text).toMatch(/(Breathe In|Inhale)/);

      // Should move to hold (7 seconds)
      await page.waitForTimeout(4500);
      text = await instruction.textContent();
      expect(text).toMatch(/Hold/);

      // Should move to exhale (8 seconds)
      await page.waitForTimeout(7500);
      text = await instruction.textContent();
      expect(text).toMatch(/(Breathe Out|Exhale)/);
    });

    test('should complete breathing cycles correctly', async ({ page }) => {
      await page.click('[data-testid="profile-deep-breathing"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      await page.waitForSelector('[data-testid="breathing-visualizer"]');

      // Check initial cycle count
      const cycleCounter = page.locator('[data-testid="cycle-counter"]');
      let count = await cycleCounter.textContent();
      expect(count).toMatch(/Cycle 1/);

      // Wait for a full breathing cycle (about 10-12 seconds)
      await page.waitForTimeout(12000);

      // Should advance to next cycle
      count = await cycleCounter.textContent();
      expect(count).toMatch(/Cycle [2-9]/);
    });
  });

  test.describe('Breathing Mobile Experience', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForSelector('[data-testid="time-display"]');

      // Start breathing on mobile
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="profile-box-breathing"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      await page.waitForSelector('[data-testid="breathing-visualizer"]');

      // Should be full-screen on mobile
      const visualizer = page.locator('[data-testid="breathing-visualizer"]');
      const bounds = await visualizer.boundingBox();
      expect(bounds?.width).toBeGreaterThan(350);
      expect(bounds?.height).toBeGreaterThan(600);

      // Should show large text on mobile
      const instruction = page.locator('[data-testid="breathing-instruction"]');
      const fontSize = await instruction.evaluate(el => window.getComputedStyle(el).fontSize);
      expect(parseInt(fontSize)).toBeGreaterThan(24);
    });

    test('should handle touch interactions during breathing', async ({ page }) => {
      await page.setViewportSize({ width: 414, height: 896 });
      await page.reload();
      await page.waitForSelector('[data-testid="time-display"]');

      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="profile-4-7-8-breathing"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      await page.waitForSelector('[data-testid="breathing-visualizer"]');

      // Test touch pause
      await page.tap('[data-testid="pause-button"]');
      await expect(page.locator('[data-testid="resume-button"]')).toBeVisible();

      // Test touch resume
      await page.tap('[data-testid="resume-button"]');
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();
    });
  });

  test.describe('Breathing Accessibility', () => {
    test('should support screen readers with proper ARIA labels', async ({ page }) => {
      await page.click('[data-testid="profile-box-breathing"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      await page.waitForSelector('[data-testid="breathing-visualizer"]');

      // Should have proper ARIA labels
      const visualizer = page.locator('[data-testid="breathing-visualizer"]');
      await expect(visualizer).toHaveAttribute('role', 'application');
      await expect(visualizer).toHaveAttribute('aria-label', /breathing exercise/i);

      // Instruction should be announced to screen readers
      const instruction = page.locator('[data-testid="breathing-instruction"]');
      await expect(instruction).toHaveAttribute('aria-live', 'polite');
    });

    test('should have high contrast mode compatibility', async ({ page }) => {
      // Enable high contrast simulation
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });

      await page.click('[data-testid="profile-deep-breathing"]');
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="start-focus-button"]');

      await page.waitForSelector('[data-testid="breathing-visualizer"]');

      // Text should remain readable in high contrast
      const instruction = page.locator('[data-testid="breathing-instruction"]');
      const color = await instruction.evaluate(el => window.getComputedStyle(el).color);
      const backgroundColor = await instruction.evaluate(el => window.getComputedStyle(el).backgroundColor);

      // Should have sufficient contrast
      expect(color).not.toBe(backgroundColor);
    });
  });
});