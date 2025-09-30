// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/services/database/IDatabase.ts
// Description: Database interface for Dependency Inversion Principle
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

/**
 * Generic database interface
 * Allows swapping implementation (IndexedDB, LocalStorage, remote DB) without changing consumers
 */
export interface IDatabase {
  /**
   * Initialize database connection
   */
  initialize(): Promise<void>;

  /**
   * Close database connection
   */
  close(): Promise<void>;

  /**
   * Check if database is initialized
   */
  isInitialized(): boolean;

  /**
   * Clear all data (for testing/reset)
   */
  clear(): Promise<void>;
}

/**
 * Generic store operations interface
 * Single Responsibility: Only defines CRUD operations
 */
export interface IStore<T> {
  add(item: Omit<T, 'id'>): Promise<T>;
  get(id: string): Promise<T | null>;
  getAll(): Promise<T[]>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
}

/**
 * Query interface for complex queries
 * Interface Segregation: Separate querying from basic CRUD
 */
export interface IQueryable<T> {
  findBy(predicate: (item: T) => boolean): Promise<T[]>;
  findOne(predicate: (item: T) => boolean): Promise<T | null>;
}

/**
 * Transaction interface for atomic operations
 */
export interface ITransaction {
  execute<T>(operation: () => Promise<T>): Promise<T>;
  rollback(): Promise<void>;
}