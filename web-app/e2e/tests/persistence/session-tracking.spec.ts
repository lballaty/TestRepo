// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/e2e/tests/persistence/session-tracking.spec.ts
// Description: E2E tests for session persistence and IndexedDB integration
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { test, expect } from '@playwright/test';

test.describe('Session Persistence & Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="time-display"]');

    // Clear any existing IndexedDB data for clean tests
    await page.evaluate(async () => {
      // Delete existing database
      const deleteReq = indexedDB.deleteDatabase('FocusTimerDB');
      return new Promise((resolve) => {
        deleteReq.onsuccess = () => resolve(undefined);
        deleteReq.onerror = () => resolve(undefined);
      });
    });

    // Wait a moment for cleanup
    await page.waitForTimeout(500);
  });

  test.describe('Session Creation and Storage', () => {
    test('should save completed session to IndexedDB', async ({ page }) => {
      // Start a short timer for testing
      await page.click('[data-testid="custom-duration-button"]');
      await page.fill('[data-testid="custom-minutes-input"]', '0');
      await page.fill('[data-testid="custom-seconds-input"]', '2');
      await page.click('[data-testid="apply-custom-duration"]');

      // Verify timer is set
      await expect(page.locator('[data-testid="time-display"]')).toHaveText('00:02');

      // Start the timer
      await page.click('[data-testid="start-focus-button"]');
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

      // Wait for timer to complete
      await page.waitForTimeout(3000);

      // Timer should be complete and back to idle
      await expect(page.locator('[data-testid="start-focus-button"]')).toBeVisible();

      // Check if session was saved to IndexedDB
      const sessionCount = await page.evaluate(async () => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open('FocusTimerDB', 1);

          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const countRequest = store.count();

            countRequest.onsuccess = () => {
              resolve(countRequest.result);
            };

            countRequest.onerror = () => reject(countRequest.error);
          };

          request.onerror = () => reject(request.error);
        });
      });

      expect(sessionCount).toBe(1);
    });

    test('should save interrupted session when stopped manually', async ({ page }) => {
      // Set a longer timer
      await page.click('[data-testid="custom-duration-button"]');
      await page.fill('[data-testid="custom-minutes-input"]', '1');
      await page.fill('[data-testid="custom-seconds-input"]', '0');
      await page.click('[data-testid="apply-custom-duration"]');

      // Start timer
      await page.click('[data-testid="start-focus-button"]');
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

      // Wait a moment then stop
      await page.waitForTimeout(1000);
      await page.click('[data-testid="pause-button"]');
      await page.click('[data-testid="stop-button"]');

      // Check session was saved as cancelled
      const sessionData = await page.evaluate(async () => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open('FocusTimerDB', 1);

          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
              resolve(getAllRequest.result);
            };

            getAllRequest.onerror = () => reject(getAllRequest.error);
          };

          request.onerror = () => reject(request.error);
        });
      });

      expect(Array.isArray(sessionData)).toBeTruthy();
      expect((sessionData as any[]).length).toBe(1);
      expect((sessionData as any[])[0].completionStatus).toBe('cancelled');
    });

    test('should track interruptions when pausing', async ({ page }) => {
      // Set a short timer but pause it first
      await page.click('[data-testid="custom-duration-button"]');
      await page.fill('[data-testid="custom-minutes-input"]', '0');
      await page.fill('[data-testid="custom-seconds-input"]', '3');
      await page.click('[data-testid="apply-custom-duration"]');

      // Start timer
      await page.click('[data-testid="start-focus-button"]');
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

      // Pause and resume a couple times
      await page.click('[data-testid="pause-button"]');
      await page.click('[data-testid="resume-button"]');

      await page.waitForTimeout(500);
      await page.click('[data-testid="pause-button"]');
      await page.click('[data-testid="resume-button"]');

      // Wait for completion
      await page.waitForTimeout(4000);

      // Check session has interruptions tracked
      const sessionData = await page.evaluate(async () => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open('FocusTimerDB', 1);

          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
              const sessions = getAllRequest.result;
              resolve(sessions[0]);
            };

            getAllRequest.onerror = () => reject(getAllRequest.error);
          };

          request.onerror = () => reject(request.error);
        });
      });

      expect((sessionData as any).interruptions).toBeGreaterThanOrEqual(2);
      expect((sessionData as any).completionStatus).toBe('completed');
    });
  });

  test.describe('Session Data Structure', () => {
    test('should store complete session metadata', async ({ page }) => {
      // Use a profile for more detailed tracking
      await page.click('[data-testid="toggle-profiles-button"]');
      await page.click('[data-testid="profile-exercise"]');
      await page.click('[data-testid="toggle-profiles-button"]');

      // Start and let complete
      await page.click('[data-testid="start-focus-button"]');
      await page.waitForTimeout(1000); // Wait for 30-second timer to complete

      // Wait for completion
      await page.waitForTimeout(1000);

      // Verify session structure
      const sessionData = await page.evaluate(async () => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open('FocusTimerDB', 1);

          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
              const sessions = getAllRequest.result;
              resolve(sessions[0]);
            };

            getAllRequest.onerror = () => reject(getAllRequest.error);
          };

          request.onerror = () => reject(request.error);
        });
      });

      const session = sessionData as any;

      // Verify required fields
      expect(session.sessionId).toBeTruthy();
      expect(session.profileId).toBe('exercise');
      expect(session.profileName).toBe('Exercise Intervals');
      expect(session.plannedDurationSeconds).toBe(30);
      expect(session.startTimestamp).toBeTruthy();
      expect(session.endTimestamp).toBeTruthy();
      expect(session.createdAt).toBeTruthy();
      expect(session.syncStatus).toBe('pending');
      expect(typeof session.actualDurationSeconds).toBe('number');
      expect(typeof session.interruptions).toBe('number');
    });
  });

  test.describe('IndexedDB Persistence', () => {
    test('should maintain data across page reloads', async ({ page }) => {
      // Complete a session
      await page.click('[data-testid="custom-duration-button"]');
      await page.fill('[data-testid="custom-seconds-input"]', '1');
      await page.click('[data-testid="apply-custom-duration"]');

      await page.click('[data-testid="start-focus-button"]');
      await page.waitForTimeout(1500);

      // Verify session exists
      let sessionCount = await page.evaluate(async () => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open('FocusTimerDB', 1);
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const countRequest = store.count();
            countRequest.onsuccess = () => resolve(countRequest.result);
            countRequest.onerror = () => reject(countRequest.error);
          };
          request.onerror = () => reject(request.error);
        });
      });

      expect(sessionCount).toBe(1);

      // Reload page
      await page.reload();
      await page.waitForSelector('[data-testid="time-display"]');

      // Verify data persists
      sessionCount = await page.evaluate(async () => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open('FocusTimerDB', 1);
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const countRequest = store.count();
            countRequest.onsuccess = () => resolve(countRequest.result);
            countRequest.onerror = () => reject(countRequest.error);
          };
          request.onerror = () => reject(request.error);
        });
      });

      expect(sessionCount).toBe(1);
    });

    test('should handle database initialization gracefully', async ({ page }) => {
      // Fresh page load should initialize database
      await page.reload();
      await page.waitForSelector('[data-testid="time-display"]');

      // Should be able to perform operations without errors
      await page.click('[data-testid="start-focus-button"]');
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();

      await page.click('[data-testid="pause-button"]');
      await page.click('[data-testid="stop-button"]');

      // Should have created database and stored session
      const dbExists = await page.evaluate(async () => {
        return new Promise((resolve) => {
          const request = indexedDB.open('FocusTimerDB', 1);
          request.onsuccess = () => {
            const db = request.result;
            const hasSessionsStore = db.objectStoreNames.contains('sessions');
            resolve(hasSessionsStore);
          };
          request.onerror = () => resolve(false);
        });
      });

      expect(dbExists).toBeTruthy();
    });
  });
});