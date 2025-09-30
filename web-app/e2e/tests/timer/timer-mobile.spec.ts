// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/e2e/tests/timer/timer-mobile.spec.ts
// Description: E2E tests for mobile responsiveness, touch targets, and iOS-specific behavior
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { test, expect } from '@playwright/test';

// Note: Mobile device testing is handled by playwright.config.ts projects
// Tests will automatically run on configured mobile devices

test.describe('Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="time-display"]');
  });

  test('should display timer correctly on mobile devices', async ({ page, isMobile }) => {
    // This test runs on all devices but checks mobile-specific behavior when on mobile
    const timeDisplay = page.locator('[data-testid="time-display"]');
    const startButton = page.locator('[data-testid="start-focus-button"]');

    await expect(timeDisplay).toBeVisible();
    await expect(startButton).toBeVisible();

    // Mobile-specific checks
    if (isMobile) {
      // Verify timer container fits in viewport on mobile
      const timerContainer = page.locator('.bg-white.rounded-3xl');
      await expect(timerContainer).toBeInViewport({ ratio: 0.9 }); // Allow small margins
    }
  });

  test('should have touch-friendly button sizes', async ({ page, isMobile }) => {
    // Check start button dimensions (min 44x44px for iOS guidelines)
    const startButton = page.locator('[data-testid="start-focus-button"]');
    const buttonBox = await startButton.boundingBox();

    expect(buttonBox).not.toBeNull();

    if (isMobile) {
      // Stricter requirements for mobile
      expect(buttonBox!.width).toBeGreaterThanOrEqual(44);
      expect(buttonBox!.height).toBeGreaterThanOrEqual(44);
    } else {
      // Desktop can have slightly smaller targets
      expect(buttonBox!.width).toBeGreaterThanOrEqual(36);
      expect(buttonBox!.height).toBeGreaterThanOrEqual(36);
    }

    // Check preset buttons are touch-friendly
    const preset30s = page.locator('[data-testid="duration-30s"]');
    const presetBox = await preset30s.boundingBox();

    expect(presetBox).not.toBeNull();
    expect(presetBox!.height).toBeGreaterThanOrEqual(36);
  });

  test('should handle touch/click interactions correctly', async ({ page, isMobile }) => {
    // Use tap on mobile, click on desktop
    const interaction = isMobile ? 'tap' : 'click';

    // Start timer
    if (isMobile) {
      await page.tap('[data-testid="start-focus-button"]');
    } else {
      await page.click('[data-testid="start-focus-button"]');
    }

    // Verify state changed
    const pauseButton = page.locator('[data-testid="pause-button"]');
    await expect(pauseButton).toBeVisible();

    // Pause timer
    if (isMobile) {
      await page.tap('[data-testid="pause-button"]');
    } else {
      await page.click('[data-testid="pause-button"]');
    }

    // Verify pause state
    const resumeButton = page.locator('[data-testid="resume-button"]');
    await expect(resumeButton).toBeVisible();
  });

  test('should show custom duration panel properly', async ({ page, isMobile }) => {
    // Open custom duration panel
    if (isMobile) {
      await page.tap('[data-testid="custom-duration-button"]');
    } else {
      await page.click('[data-testid="custom-duration-button"]');
    }

    // Verify inputs are visible
    const minutesInput = page.locator('[data-testid="custom-minutes-input"]');
    const secondsInput = page.locator('[data-testid="custom-seconds-input"]');

    await expect(minutesInput).toBeVisible();
    await expect(secondsInput).toBeVisible();

    // On mobile, verify panel is in viewport
    if (isMobile) {
      await expect(minutesInput).toBeInViewport();
    }
  });
});

test.describe('Small Screen Adaptation', () => {
  test('should adapt layout for small screens', async ({ page, viewport }) => {
    // This test is relevant for all screen sizes
    const timeDisplay = page.locator('[data-testid="time-display"]');
    const startButton = page.locator('[data-testid="start-focus-button"]');
    const presetButtons = page.locator('button').filter({ hasText: /min|sec/ });

    await expect(timeDisplay).toBeVisible();
    await expect(startButton).toBeVisible();

    // Count visible preset buttons
    const presetCount = await presetButtons.count();
    expect(presetCount).toBeGreaterThan(0);

    // On very small screens, verify essential elements still fit
    if (viewport && viewport.width <= 375) {
      const container = page.locator('.bg-white.rounded-3xl');
      await expect(container).toBeInViewport({ ratio: 0.9 });
    }
  });

  test('should have readable text sizes', async ({ page }) => {
    // Check font sizes are readable
    const timeDisplay = page.locator('[data-testid="time-display"]');
    const fontSize = await timeDisplay.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return parseInt(styles.fontSize);
    });

    // Should be large enough to read (at least 40px for time display)
    expect(fontSize).toBeGreaterThanOrEqual(40);
  });
});

test.describe('Tablet Layout', () => {
  test('should utilize screen space effectively', async ({ page, viewport }) => {
    // Verify layout uses appropriate spacing for all screen sizes
    const timerContainer = page.locator('.bg-white.rounded-3xl');
    const containerBox = await timerContainer.boundingBox();

    expect(containerBox).not.toBeNull();

    // On tablets, verify appropriate width constraints
    if (viewport && viewport.width >= 768) {
      expect(containerBox!.width).toBeLessThanOrEqual(600); // Max width constraint
      expect(containerBox!.width).toBeGreaterThan(300); // Not too narrow
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper button labels', async ({ page }) => {
    // Check for accessible button labels
    const startButton = page.locator('[data-testid="start-focus-button"]');
    const buttonText = await startButton.textContent();
    expect(buttonText).toContain('Start Focus Session');

    // Verify timer display is accessible
    const timeDisplay = page.locator('[data-testid="time-display"]');
    await expect(timeDisplay).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page, isMobile }) => {
    // Skip on mobile as they don't have keyboards
    test.skip(isMobile === true, 'Keyboard navigation not applicable on mobile');

    // Tab to start button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Press Enter to start
    await page.keyboard.press('Enter');

    // Verify timer started
    const pauseButton = page.locator('[data-testid="pause-button"]');
    await expect(pauseButton).toBeVisible();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Check button contrast
    const startButton = page.locator('[data-testid="start-focus-button"]');
    const backgroundColor = await startButton.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });

    const textColor = await startButton.evaluate(el => {
      return window.getComputedStyle(el).color;
    });

    // Verify colors are different (basic check)
    expect(backgroundColor).not.toBe(textColor);
  });

  test('should provide timer status information', async ({ page }) => {
    // Start timer
    await page.click('[data-testid="start-focus-button"]');

    // Check for status text
    const statusText = await page.textContent('text=/Timer Status/');
    expect(statusText).toContain('Timer Status');
  });
});

test.describe('Orientation Changes', () => {
  test('should handle viewport size changes', async ({ page, isMobile }) => {
    // Start with current viewport
    const initialDisplay = page.locator('[data-testid="time-display"]');
    await expect(initialDisplay).toBeVisible();

    // Simulate viewport change (portrait to landscape on mobile)
    if (isMobile) {
      const viewport = page.viewportSize();
      if (viewport) {
        // Swap width and height to simulate rotation
        await page.setViewportSize({ width: viewport.height, height: viewport.width });
      }
    } else {
      // On desktop, test responsive resize
      await page.setViewportSize({ width: 400, height: 800 });
    }

    // Verify elements still visible and functional after resize
    await expect(initialDisplay).toBeVisible();
    const startButton = page.locator('[data-testid="start-focus-button"]');
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();
  });
});

test.describe('PWA Installation Readiness', () => {
  test('should have viewport meta tag for mobile', async ({ page }) => {
    const viewport = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta?.getAttribute('content');
    });

    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1');
  });

  test('should have apple mobile web app meta tags', async ({ page }) => {
    const appleMeta = await page.evaluate(() => {
      const capable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      return capable?.getAttribute('content');
    });

    expect(appleMeta).toBe('yes');
  });
});