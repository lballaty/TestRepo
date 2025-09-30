// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/services/repositories/ProfileRepository.ts
// Description: Profile repository implementation with SOLID principles
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { IProfileRepository, Profile, CreateProfileInput, UpdateProfileInput, ProfileCategory } from '@/types/profile.types';
import { IndexedDBService } from '../database/IndexedDBService';
import { generateUUID } from '@/utils/uuid';

/**
 * Profile Repository
 * Single Responsibility: Manage profile data operations
 * Dependency Inversion: Depends on IDatabase abstraction
 */
export class ProfileRepository implements IProfileRepository {
  private db: IndexedDBService;

  constructor(database: IndexedDBService) {
    this.db = database;
  }

  /**
   * Create new profile
   * Memory-conscious: No large object retention
   */
  public async create(input: CreateProfileInput): Promise<Profile> {
    const now = new Date();
    const profile: Profile = {
      ...input,
      id: generateUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const db = this.db.getDB();
    await db.add('profiles', profile);

    return profile;
  }

  /**
   * Update existing profile
   * Only updates specified fields
   */
  public async update(id: string, input: UpdateProfileInput): Promise<Profile> {
    const db = this.db.getDB();
    const existing = await db.get('profiles', id);

    if (!existing) {
      throw new Error(`Profile with id ${id} not found`);
    }

    const updated: Profile = {
      ...existing,
      ...input,
      id, // Ensure ID doesn't change
      createdAt: existing.createdAt, // Preserve creation date
      updatedAt: new Date(),
    };

    await db.put('profiles', updated);

    return updated;
  }

  /**
   * Delete profile
   */
  public async delete(id: string): Promise<void> {
    const db = this.db.getDB();
    await db.delete('profiles', id);
  }

  /**
   * Find profile by ID
   */
  public async findById(id: string): Promise<Profile | null> {
    const db = this.db.getDB();
    const profile = await db.get('profiles', id);
    return profile || null;
  }

  /**
   * Find all profiles
   * Memory-efficient: Returns array reference, no duplication
   */
  public async findAll(): Promise<Profile[]> {
    const db = this.db.getDB();
    return db.getAll('profiles');
  }

  /**
   * Find profiles by category
   * Uses index for efficient querying
   */
  public async findByCategory(category: ProfileCategory): Promise<Profile[]> {
    const db = this.db.getDB();
    return db.getAllFromIndex('profiles', 'by-category', category);
  }

  /**
   * Get recently updated profiles
   * Memory-efficient: Uses cursor to limit results
   */
  public async getRecent(limit: number = 10): Promise<Profile[]> {
    const db = this.db.getDB();
    const tx = db.transaction('profiles', 'readonly');
    const index = tx.objectStore('profiles').index('by-updated');

    const profiles: Profile[] = [];
    let cursor = await index.openCursor(null, 'prev'); // Descending order

    while (cursor && profiles.length < limit) {
      profiles.push(cursor.value);
      cursor = await cursor.continue();
    }

    return profiles;
  }

  /**
   * Count total profiles
   */
  public async count(): Promise<number> {
    const db = this.db.getDB();
    return db.count('profiles');
  }
}