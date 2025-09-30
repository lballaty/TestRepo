// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/playwright.config.ts
// Description: Playwright configuration for comprehensive E2E testing of Focus Timer PWA with mobile and desktop viewports
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Focus Timer PWA
 *
 * Business Purpose: Ensures all GUI functions are thoroughly tested across
 * different devices and screen sizes, with particular emphasis on mobile
 * experience for iOS users and exercise timer functionality.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:9000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Desktop Testing
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile Testing (Critical for PWA)
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'iPhone SE',
      use: { ...devices['iPhone SE'] },
    },
    {
      name: 'iPhone 14 Pro Max',
      use: { ...devices['iPhone 14 Pro Max'] },
    },
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // Run local dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:9000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});