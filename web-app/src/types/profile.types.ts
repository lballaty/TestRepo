// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/types/profile.types.ts
// Description: Profile and session type definitions
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

/**
 * Profile category enum
 */
export enum ProfileCategory {
  WORK = 'work',
  STUDY = 'study',
  EXERCISE = 'exercise',
  MEDITATION = 'meditation',
  BREAK = 'break',
  CUSTOM = 'custom',
}

/**
 * Profile interface
 * Represents a timer profile configuration
 */
export interface Profile {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly category: ProfileCategory;
  readonly durationMinutes: number;
  readonly breakDurationMinutes: number;
  readonly longBreakDurationMinutes: number;
  readonly breakFrequency: number; // Sessions before long break
  readonly notificationSound?: string;
  readonly themeColor?: string;
  readonly aiCoachingEnabled: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Profile creation input
 * Open/Closed Principle: Closed for modification, open for extension
 */
export type CreateProfileInput = Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Profile update input
 * Partial allows updating only specific fields
 */
export type UpdateProfileInput = Partial<Omit<Profile, 'id' | 'createdAt'>>;

/**
 * Session completion status
 */
export enum SessionStatus {
  COMPLETED = 'completed',
  STOPPED = 'stopped',
  INTERRUPTED = 'interrupted',
}

/**
 * Session interface
 * Records a completed or partial timer session
 */
export interface Session {
  readonly id: string;
  readonly profileId: string;
  readonly startedAt: Date;
  readonly completedAt: Date | null;
  readonly plannedDurationMinutes: number;
  readonly actualDurationMinutes: number;
  readonly completionStatus: SessionStatus;
  readonly pauseCount: number;
  readonly totalPauseDurationMinutes: number;
  readonly notes?: string;
  readonly aiFeedback?: string;
}

/**
 * Session statistics interface
 */
export interface SessionStatistics {
  readonly totalSessions: number;
  readonly completedSessions: number;
  readonly totalMinutes: number;
  readonly averageDurationMinutes: number;
  readonly completionRate: number;
  readonly mostProductiveHour: number;
  readonly longestStreak: number;
  readonly currentStreak: number;
}

/**
 * Repository interfaces (Dependency Inversion Principle)
 */
export interface IProfileRepository {
  create(profile: CreateProfileInput): Promise<Profile>;
  update(id: string, profile: UpdateProfileInput): Promise<Profile>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Profile | null>;
  findAll(): Promise<Profile[]>;
  findByCategory(category: ProfileCategory): Promise<Profile[]>;
}

export interface ISessionRepository {
  create(session: Omit<Session, 'id'>): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  findByProfileId(profileId: string): Promise<Session[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Session[]>;
  getStatistics(profileId?: string): Promise<SessionStatistics>;
}