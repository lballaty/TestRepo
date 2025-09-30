// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/services/storage/SessionPersistenceService.ts
// Description: IndexedDB service for persisting timer sessions and user data
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

interface TimerSession {
  sessionId: string;
  profileId: string;
  profileName: string;
  plannedDurationSeconds: number;
  actualDurationSeconds: number;
  completionStatus: 'completed' | 'paused' | 'cancelled' | 'interrupted';
  startTimestamp: number;
  endTimestamp?: number;
  interruptions: number;
  productivity_rating?: number; // 1-5 scale
  notes?: string;
  createdAt: number;
  syncStatus: 'pending' | 'synced' | 'failed';
}

interface SessionStatistics {
  totalSessions: number;
  totalFocusTime: number; // in seconds
  averageSessionLength: number;
  completionRate: number; // percentage
  mostProductiveHour: number; // 0-23
  favoriteProfile: string;
  currentStreak: number;
  longestStreak: number;
  weeklyFocusTime: number;
  monthlyFocusTime: number;
}

class SessionPersistenceService {
  private dbName = 'FocusTimerDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  private readonly SESSIONS_STORE = 'sessions';
  private readonly STATISTICS_STORE = 'statistics';
  private readonly PREFERENCES_STORE = 'preferences';

  /**
   * Initialize IndexedDB connection with proper error handling.
   *
   * Business Purpose: Provides offline-first data storage for user's
   * productivity tracking and session history.
   */
  async initializeDatabase(): Promise<void> {
    if (this.db) {
      return; // Already initialized
    }

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create sessions object store
        if (!db.objectStoreNames.contains(this.SESSIONS_STORE)) {
          const sessionsStore = db.createObjectStore(this.SESSIONS_STORE, {
            keyPath: 'sessionId'
          });

          // Create indexes for efficient querying
          sessionsStore.createIndex('profileId', 'profileId', { unique: false });
          sessionsStore.createIndex('startTimestamp', 'startTimestamp', { unique: false });
          sessionsStore.createIndex('completionStatus', 'completionStatus', { unique: false });
          sessionsStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        // Create statistics object store
        if (!db.objectStoreNames.contains(this.STATISTICS_STORE)) {
          db.createObjectStore(this.STATISTICS_STORE, {
            keyPath: 'statType' // 'daily', 'weekly', 'monthly', 'allTime'
          });
        }

        // Create preferences object store
        if (!db.objectStoreNames.contains(this.PREFERENCES_STORE)) {
          db.createObjectStore(this.PREFERENCES_STORE, {
            keyPath: 'preferenceKey'
          });
        }

        console.log('IndexedDB schema upgraded successfully');
      };
    });
  }

  /**
   * Save completed timer session to IndexedDB.
   *
   * Business Purpose: Tracks user productivity patterns for analytics
   * and coaching insights, all stored locally.
   */
  async saveTimerSession(sessionData: Omit<TimerSession, 'sessionId' | 'createdAt' | 'syncStatus'>): Promise<string> {
    await this.initializeDatabase();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: TimerSession = {
      ...sessionData,
      sessionId,
      createdAt: Date.now(),
      syncStatus: 'pending'
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.SESSIONS_STORE], 'readwrite');
      const store = transaction.objectStore(this.SESSIONS_STORE);

      const request = store.add(session);

      request.onsuccess = () => {
        console.log('Session saved successfully:', sessionId);
        this.updateStatisticsAfterSession(session);
        resolve(sessionId);
      };

      request.onerror = () => {
        reject(new Error(`Failed to save session: ${request.error?.message}`));
      };
    });
  }

  /**
   * Get recent timer sessions for display and analysis.
   *
   * Business Purpose: Shows user their recent productivity history
   * for motivation and pattern recognition.
   */
  async getRecentTimerSessions(limit: number = 50): Promise<TimerSession[]> {
    await this.initializeDatabase();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.SESSIONS_STORE], 'readonly');
      const store = transaction.objectStore(this.SESSIONS_STORE);
      const index = store.index('startTimestamp');

      const request = index.openCursor(null, 'prev'); // Most recent first
      const sessions: TimerSession[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;

        if (cursor && sessions.length < limit) {
          sessions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(sessions);
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to retrieve sessions: ${request.error?.message}`));
      };
    });
  }

  /**
   * Get sessions filtered by date range and profile.
   *
   * Business Purpose: Enables detailed productivity analysis
   * for specific time periods and activity types.
   */
  async getSessionsByDateRange(startDate: Date, endDate: Date, profileId?: string): Promise<TimerSession[]> {
    await this.initializeDatabase();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.SESSIONS_STORE], 'readonly');
      const store = transaction.objectStore(this.SESSIONS_STORE);
      const index = store.index('startTimestamp');

      const range = IDBKeyRange.bound(startTimestamp, endTimestamp);
      const request = index.openCursor(range);
      const sessions: TimerSession[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;

        if (cursor) {
          const session = cursor.value;

          // Filter by profile if specified
          if (!profileId || session.profileId === profileId) {
            sessions.push(session);
          }

          cursor.continue();
        } else {
          resolve(sessions);
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to retrieve sessions by date range: ${request.error?.message}`));
      };
    });
  }

  /**
   * Calculate and cache productivity statistics.
   *
   * Business Purpose: Provides users with insights into their
   * productivity patterns and progress tracking.
   */
  private async updateStatisticsAfterSession(session: TimerSession): Promise<void> {
    try {
      // Get all sessions for calculation
      const allSessions = await this.getRecentTimerSessions(1000);

      // Calculate statistics
      const stats = this.calculateSessionStatistics(allSessions);

      // Save to statistics store
      await this.saveStatistics('allTime', stats);

      console.log('Statistics updated after session completion');
    } catch (error) {
      console.error('Failed to update statistics:', error);
    }
  }

  /**
   * Calculate comprehensive session statistics from raw data.
   */
  private calculateSessionStatistics(sessions: TimerSession[]): SessionStatistics {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalFocusTime: 0,
        averageSessionLength: 0,
        completionRate: 0,
        mostProductiveHour: 9, // Default to 9 AM
        favoriteProfile: 'pomodoro',
        currentStreak: 0,
        longestStreak: 0,
        weeklyFocusTime: 0,
        monthlyFocusTime: 0
      };
    }

    const completedSessions = sessions.filter(s => s.completionStatus === 'completed');
    const totalFocusTime = completedSessions.reduce((sum, s) => sum + s.actualDurationSeconds, 0);
    const completionRate = (completedSessions.length / sessions.length) * 100;

    // Calculate most productive hour
    const hourCounts: { [hour: number]: number } = {};
    sessions.forEach(session => {
      const hour = new Date(session.startTimestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const mostProductiveHour = Object.keys(hourCounts).reduce((max, hour) =>
      hourCounts[Number(hour)] > (hourCounts[Number(max)] || 0) ? hour : max, '9'
    );

    // Calculate favorite profile
    const profileCounts: { [profileId: string]: number } = {};
    sessions.forEach(session => {
      profileCounts[session.profileId] = (profileCounts[session.profileId] || 0) + 1;
    });
    const favoriteProfile = Object.keys(profileCounts).reduce((max, profile) =>
      profileCounts[profile] > (profileCounts[max] || 0) ? profile : max, 'pomodoro'
    );

    // Calculate weekly and monthly focus time
    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000);

    const weeklyFocusTime = completedSessions
      .filter(s => s.startTimestamp >= weekAgo)
      .reduce((sum, s) => sum + s.actualDurationSeconds, 0);

    const monthlyFocusTime = completedSessions
      .filter(s => s.startTimestamp >= monthAgo)
      .reduce((sum, s) => sum + s.actualDurationSeconds, 0);

    return {
      totalSessions: sessions.length,
      totalFocusTime,
      averageSessionLength: totalFocusTime / Math.max(completedSessions.length, 1),
      completionRate,
      mostProductiveHour: Number(mostProductiveHour),
      favoriteProfile,
      currentStreak: this.calculateCurrentStreak(sessions),
      longestStreak: this.calculateLongestStreak(sessions),
      weeklyFocusTime,
      monthlyFocusTime
    };
  }

  /**
   * Calculate current consecutive days with completed sessions.
   */
  private calculateCurrentStreak(sessions: TimerSession[]): number {
    const completedSessions = sessions
      .filter(s => s.completionStatus === 'completed')
      .sort((a, b) => b.startTimestamp - a.startTimestamp);

    if (completedSessions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of completedSessions) {
      const sessionDate = new Date(session.startTimestamp);
      sessionDate.setHours(0, 0, 0, 0);

      if (sessionDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (sessionDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  }

  /**
   * Calculate longest historical streak.
   */
  private calculateLongestStreak(sessions: TimerSession[]): number {
    // Implementation for longest streak calculation
    // This would be similar to currentStreak but track the maximum
    return Math.max(this.calculateCurrentStreak(sessions), 0);
  }

  /**
   * Save statistics to IndexedDB.
   */
  private async saveStatistics(statType: string, stats: SessionStatistics): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STATISTICS_STORE], 'readwrite');
      const store = transaction.objectStore(this.STATISTICS_STORE);

      const request = store.put({
        statType,
        ...stats,
        updatedAt: Date.now()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to save statistics: ${request.error?.message}`));
    });
  }

  /**
   * Get cached statistics from IndexedDB.
   */
  async getSessionStatistics(statType: string = 'allTime'): Promise<SessionStatistics | null> {
    await this.initializeDatabase();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STATISTICS_STORE], 'readonly');
      const store = transaction.objectStore(this.STATISTICS_STORE);

      const request = store.get(statType);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Remove metadata fields
          const { statType: _, updatedAt, ...stats } = result;
          resolve(stats as SessionStatistics);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to retrieve statistics: ${request.error?.message}`));
      };
    });
  }

  /**
   * Get pending sessions that need to be synced to cloud (if applicable).
   */
  async getPendingSyncSessions(): Promise<TimerSession[]> {
    await this.initializeDatabase();

    if (!this.db) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.SESSIONS_STORE], 'readonly');
      const store = transaction.objectStore(this.SESSIONS_STORE);
      const index = store.index('syncStatus');

      const request = index.getAll('pending');

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error(`Failed to retrieve pending sessions: ${request.error?.message}`));
      };
    });
  }

  /**
   * Mark sessions as synced after successful cloud upload.
   */
  async markSessionsAsSynced(sessionIds: string[]): Promise<void> {
    await this.initializeDatabase();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.SESSIONS_STORE], 'readwrite');
      const store = transaction.objectStore(this.SESSIONS_STORE);

      let completed = 0;
      const total = sessionIds.length;

      if (total === 0) {
        resolve();
        return;
      }

      sessionIds.forEach(sessionId => {
        const getRequest = store.get(sessionId);

        getRequest.onsuccess = () => {
          const session = getRequest.result;
          if (session) {
            session.syncStatus = 'synced';

            const putRequest = store.put(session);
            putRequest.onsuccess = () => {
              completed++;
              if (completed === total) {
                resolve();
              }
            };
          } else {
            completed++;
            if (completed === total) {
              resolve();
            }
          }
        };

        getRequest.onerror = () => {
          reject(new Error(`Failed to update session sync status: ${getRequest.error?.message}`));
        };
      });
    });
  }

  /**
   * Clear all session data (for privacy/reset purposes).
   */
  async clearAllSessionData(): Promise<void> {
    await this.initializeDatabase();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.SESSIONS_STORE, this.STATISTICS_STORE], 'readwrite');

      let completed = 0;
      const total = 2;

      const clearStore = (storeName: string) => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            console.log('All session data cleared successfully');
            resolve();
          }
        };

        request.onerror = () => {
          reject(new Error(`Failed to clear ${storeName}: ${request.error?.message}`));
        };
      };

      clearStore(this.SESSIONS_STORE);
      clearStore(this.STATISTICS_STORE);
    });
  }
}

// Export singleton instance
export const sessionPersistenceService = new SessionPersistenceService();
export type { TimerSession, SessionStatistics };