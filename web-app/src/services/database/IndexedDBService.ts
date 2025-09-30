// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/services/database/IndexedDBService.ts
// Description: IndexedDB implementation with memory-efficient design
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { IDatabase } from './IDatabase';
import { Profile, Session } from '@/types/profile.types';

/**
 * Database schema definition
 */
interface FocusTimerDB extends DBSchema {
  profiles: {
    key: string;
    value: Profile;
    indexes: { 'by-category': string; 'by-updated': Date };
  };
  sessions: {
    key: string;
    value: Session;
    indexes: { 'by-profile': string; 'by-date': Date; 'by-status': string };
  };
}

/**
 * IndexedDB Service
 * Single Responsibility: Manage IndexedDB connection and operations
 * Memory-conscious: Uses cursors for large datasets, implements cleanup
 */
export class IndexedDBService implements IDatabase {
  private static instance: IndexedDBService | null = null;
  private db: IDBPDatabase<FocusTimerDB> | null = null;
  private readonly DB_NAME = 'focus-timer-db';
  private readonly DB_VERSION = 1;
  private initialized = false;

  // Singleton pattern for memory efficiency
  private constructor() {}

  /**
   * Get singleton instance
   * Liskov Substitution: Can be replaced with any IDatabase implementation
   */
  public static getInstance(): IndexedDBService {
    if (!IndexedDBService.instance) {
      IndexedDBService.instance = new IndexedDBService();
    }
    return IndexedDBService.instance;
  }

  /**
   * Initialize database with schema
   * Creates object stores and indexes
   */
  public async initialize(): Promise<void> {
    if (this.initialized && this.db) {
      return;
    }

    try {
      this.db = await openDB<FocusTimerDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction) {
          // Create profiles store
          if (!db.objectStoreNames.contains('profiles')) {
            const profileStore = db.createObjectStore('profiles', {
              keyPath: 'id',
            });
            profileStore.createIndex('by-category', 'category');
            profileStore.createIndex('by-updated', 'updatedAt');
          }

          // Create sessions store
          if (!db.objectStoreNames.contains('sessions')) {
            const sessionStore = db.createObjectStore('sessions', {
              keyPath: 'id',
            });
            sessionStore.createIndex('by-profile', 'profileId');
            sessionStore.createIndex('by-date', 'startedAt');
            sessionStore.createIndex('by-status', 'completionStatus');
          }
        },
        blocked() {
          console.warn('Database upgrade blocked by another connection');
        },
        blocking() {
          console.warn('Database connection blocking an upgrade');
        },
        terminated() {
          console.error('Database connection terminated unexpectedly');
        },
      });

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw new Error('Database initialization failed');
    }
  }

  /**
   * Close database connection
   * Memory management: Release resources
   */
  public async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }

  /**
   * Check initialization status
   */
  public isInitialized(): boolean {
    return this.initialized && this.db !== null;
  }

  /**
   * Clear all data
   * Useful for testing and data reset
   */
  public async clear(): Promise<void> {
    this.ensureInitialized();
    const tx = this.db!.transaction(['profiles', 'sessions'], 'readwrite');
    await Promise.all([
      tx.objectStore('profiles').clear(),
      tx.objectStore('sessions').clear(),
      tx.done,
    ]);
  }

  /**
   * Get database instance
   * Throws if not initialized
   */
  public getDB(): IDBPDatabase<FocusTimerDB> {
    this.ensureInitialized();
    return this.db!;
  }

  /**
   * Ensure database is initialized
   * @throws Error if not initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
  }

  /**
   * Memory-efficient cleanup
   * Removes old data to prevent unlimited growth
   */
  public async cleanup(retentionDays: number = 90): Promise<void> {
    this.ensureInitialized();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const tx = this.db!.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    const index = store.index('by-date');

    // Use cursor for memory-efficient iteration
    let cursor = await index.openCursor(IDBKeyRange.upperBound(cutoffDate));
    let deletedCount = 0;

    while (cursor) {
      await cursor.delete();
      deletedCount++;
      cursor = await cursor.continue();
    }

    await tx.done;

    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} old sessions`);
    }
  }
}