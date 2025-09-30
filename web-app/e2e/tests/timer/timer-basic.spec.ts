// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/e2e/tests/timer/timer-basic.spec.ts
// Description: Basic timer functionality E2E tests covering start, pause, resume, stop, and reset operations
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { test, expect } from '@playwright/test';

test.describe('Timer Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="time-display"]');
  });

  test('should display initial timer state correctly', async ({ page }) => {
    // Verify initial time display
    const timeDisplay = await page.textContent('[data-testid="time-display"]');
    expect(timeDisplay).toBe('25:00');

    // Verify start button is present
    const startButton = page.locator('[data-testid="start-focus-button"]');
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();

    // Verify progress circle is at 0%
    const progressText = await page.textContent('text=/0% complete/');
    expect(progressText).toContain('0% complete');
  });

  test('should start timer when Start button is clicked', async ({ page }) => {
    // Click start button
    await page.click('[data-testid="start-focus-button"]');

    // Verify pause button appears
    const pauseButton = page.locator('[data-testid="pause-button"]');
    await expect(pauseButton).toBeVisible();

    // Wait for timer to tick
    await page.waitForTimeout(2000);

    // Verify time has decreased
    const timeDisplay = await page.textContent('[data-testid="time-display"]');
    expect(timeDisplay).not.toBe('25:00');

    // Parse and verify time is less than 25:00
    const [minutes, seconds] = timeDisplay!.split(':').map(Number);
    const totalSeconds = minutes * 60 + seconds;
    expect(totalSeconds).toBeLessThan(1500);
    expect(totalSeconds).toBeGreaterThan(1497);
  });

  test('should pause timer when Pause button is clicked', async ({ page }) => {
    // Start timer
    await page.click('[data-testid="start-focus-button"]');

    // Wait for timer to run
    await page.waitForTimeout(1000);

    // Pause timer
    await page.click('[data-testid="pause-button"]');

    // Verify Resume and Stop buttons appear
    const resumeButton = page.locator('[data-testid="resume-button"]');
    const stopButton = page.locator('[data-testid="stop-button"]');
    await expect(resumeButton).toBeVisible();
    await expect(stopButton).toBeVisible();

    // Get current time
    const pausedTime = await page.textContent('[data-testid="time-display"]');

    // Wait and verify time hasn't changed
    await page.waitForTimeout(1000);
    const afterPauseTime = await page.textContent('[data-testid="time-display"]');
    expect(afterPauseTime).toBe(pausedTime);
  });

  test('should resume timer from paused state', async ({ page }) => {
    // Start and pause timer
    await page.click('[data-testid="start-focus-button"]');
    await page.waitForTimeout(1000);
    await page.click('[data-testid="pause-button"]');

    const pausedTime = await page.textContent('[data-testid="time-display"]');
    const [pausedMinutes, pausedSeconds] = pausedTime!.split(':').map(Number);
    const pausedTotalSeconds = pausedMinutes * 60 + pausedSeconds;

    // Resume timer
    await page.click('[data-testid="resume-button"]');

    // Verify pause button reappears
    const pauseButton = page.locator('[data-testid="pause-button"]');
    await expect(pauseButton).toBeVisible();

    // Wait and verify timer continues counting down
    await page.waitForTimeout(2000);
    const resumedTime = await page.textContent('[data-testid="time-display"]');
    const [resumedMinutes, resumedSeconds] = resumedTime!.split(':').map(Number);
    const resumedTotalSeconds = resumedMinutes * 60 + resumedSeconds;

    expect(resumedTotalSeconds).toBeLessThan(pausedTotalSeconds);
  });

  test('should stop timer and show reset button', async ({ page }) => {
    // Start timer
    await page.click('[data-testid="start-focus-button"]');
    await page.waitForTimeout(1000);

    // Pause then stop
    await page.click('[data-testid="pause-button"]');
    await page.click('[data-testid="stop-button"]');

    // Verify reset button appears
    const resetButton = page.locator('[data-testid="reset-timer-button"]');
    await expect(resetButton).toBeVisible();
  });

  test('should reset timer to initial state', async ({ page }) => {
    // Start, pause, stop timer
    await page.click('[data-testid="start-focus-button"]');
    await page.waitForTimeout(2000);
    await page.click('[data-testid="pause-button"]');
    await page.click('[data-testid="stop-button"]');

    // Reset timer
    await page.click('[data-testid="reset-timer-button"]');

    // Verify timer returns to initial state
    const timeDisplay = await page.textContent('[data-testid="time-display"]');
    expect(timeDisplay).toBe('25:00');

    // Verify start button reappears
    const startButton = page.locator('[data-testid="start-focus-button"]');
    await expect(startButton).toBeVisible();

    // Verify progress is back to 0%
    const progressText = await page.textContent('text=/0% complete/');
    expect(progressText).toContain('0% complete');
  });

  test('should update progress circle as timer runs', async ({ page }) => {
    // Set a short duration for testing
    await page.click('[data-testid="duration-30s"]');

    // Start timer
    await page.click('[data-testid="start-focus-button"]');

    // Get initial progress
    const initialProgress = await page.textContent('text=/%/');
    expect(initialProgress).toContain('0%');

    // Wait for some progress
    await page.waitForTimeout(3000);

    // Verify progress has increased
    const progressAfter3s = await page.textContent('text=/%/');
    const progressValue = parseInt(progressAfter3s!.match(/(\d+)%/)![1]);
    expect(progressValue).toBeGreaterThan(5);
    expect(progressValue).toBeLessThan(15);

    // Verify progress circle SVG is updating
    const progressCircle = page.locator('[data-testid="progress-circle"]');
    const strokeDashoffset = await progressCircle.getAttribute('stroke-dashoffset');
    expect(strokeDashoffset).not.toBe(null);
  });

  test('should complete timer and show completion message', async ({ page }) => {
    // Set very short duration for testing
    await page.click('[data-testid="duration-30s"]');

    // Manually set to 2 seconds for faster testing
    await page.click('[data-testid="custom-duration-button"]');
    await page.fill('[data-testid="custom-minutes-input"]', '0');
    await page.fill('[data-testid="custom-seconds-input"]', '3');
    await page.click('[data-testid="apply-custom-duration"]');

    // Start timer
    await page.click('[data-testid="start-focus-button"]');

    // Wait for completion
    await page.waitForTimeout(4000);

    // Verify completion message appears
    const completionMessage = page.locator('text=/Session Complete/');
    await expect(completionMessage).toBeVisible();

    // Verify time shows 00:00
    const timeDisplay = await page.textContent('[data-testid="time-display"]');
    expect(timeDisplay).toBe('00:00');

    // Verify 100% progress
    const progressText = await page.textContent('text=/%/');
    expect(progressText).toContain('100%');
  });

  test('should maintain timer state across page visibility changes', async ({ page, context }) => {
    // Start timer
    await page.click('[data-testid="start-focus-button"]');
    await page.waitForTimeout(1000);

    const timeBeforeHide = await page.textContent('[data-testid="time-display"]');

    // Simulate tab switch (page becomes hidden)
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await page.waitForTimeout(2000);

    // Simulate returning to tab
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    const timeAfterReturn = await page.textContent('[data-testid="time-display"]');

    // Verify timer continued running
    const [beforeMinutes, beforeSeconds] = timeBeforeHide!.split(':').map(Number);
    const [afterMinutes, afterSeconds] = timeAfterReturn!.split(':').map(Number);
    const beforeTotal = beforeMinutes * 60 + beforeSeconds;
    const afterTotal = afterMinutes * 60 + afterSeconds;

    expect(afterTotal).toBeLessThan(beforeTotal);
    expect(beforeTotal - afterTotal).toBeGreaterThanOrEqual(1);
  });
});