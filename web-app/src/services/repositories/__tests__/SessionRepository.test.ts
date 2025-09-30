// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/services/repositories/__tests__/SessionRepository.test.ts
// Description: Comprehensive unit tests for SessionRepository with statistics calculation validation
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { SessionRepository } from '../SessionRepository';
import { IndexedDBService } from '../../database/IndexedDBService';
import { Session, SessionStatus } from '@/types/profile.types';
import { subDays, startOfDay, endOfDay, addHours } from 'date-fns';

describe('SessionRepository', () => {
  let repository: SessionRepository;
  let dbService: IndexedDBService;

  beforeEach(async () => {
    dbService = IndexedDBService.getInstance();
    await dbService.initialize();
    await dbService.clear();
    repository = new SessionRepository(dbService);
  });

  afterEach(async () => {
    await dbService.clear();
  });

  describe('create', () => {
    it('should create session with generated ID', async () => {
      const sessionInput = {
        profileId: 'profile-123',
        startedAt: new Date(),
        completedAt: new Date(),
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      };

      const session = await repository.create(sessionInput);

      expect(session.id).toBeDefined();
      expect(session.id).not.toBe('');
      expect(session.profileId).toBe('profile-123');
      expect(session.plannedDurationMinutes).toBe(25);
      expect(session.completionStatus).toBe(SessionStatus.COMPLETED);
    });

    it('should handle multiple sessions with unique IDs', async () => {
      const sessionInput1 = {
        profileId: 'profile-123',
        startedAt: new Date(),
        completedAt: new Date(),
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      };

      const sessionInput2 = {
        profileId: 'profile-456',
        startedAt: new Date(),
        completedAt: new Date(),
        plannedDurationMinutes: 50,
        actualDurationMinutes: 45,
        completionStatus: SessionStatus.STOPPED,
        pauseCount: 2,
        totalPauseDurationMinutes: 5,
      };

      const session1 = await repository.create(sessionInput1);
      const session2 = await repository.create(sessionInput2);

      expect(session1.id).not.toBe(session2.id);
      expect(session1.profileId).toBe('profile-123');
      expect(session2.profileId).toBe('profile-456');
    });
  });

  describe('findById', () => {
    it('should find existing session', async () => {
      const sessionInput = {
        profileId: 'profile-123',
        startedAt: new Date(),
        completedAt: new Date(),
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
        notes: 'Test session',
      };

      const created = await repository.create(sessionInput);
      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.notes).toBe('Test session');
    });

    it('should return null for non-existent ID', async () => {
      const found = await repository.findById('non-existent-session-id');
      expect(found).toBeNull();
    });
  });

  describe('findByProfileId', () => {
    it('should return all sessions for profile', async () => {
      const profileId = 'profile-123';

      // Create multiple sessions for the same profile
      await repository.create({
        profileId,
        startedAt: new Date(),
        completedAt: new Date(),
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      await repository.create({
        profileId,
        startedAt: new Date(),
        completedAt: new Date(),
        plannedDurationMinutes: 25,
        actualDurationMinutes: 20,
        completionStatus: SessionStatus.STOPPED,
        pauseCount: 1,
        totalPauseDurationMinutes: 5,
      });

      // Create session for different profile
      await repository.create({
        profileId: 'profile-456',
        startedAt: new Date(),
        completedAt: new Date(),
        plannedDurationMinutes: 50,
        actualDurationMinutes: 50,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      const sessions = await repository.findByProfileId(profileId);

      expect(sessions).toHaveLength(2);
      expect(sessions.every(s => s.profileId === profileId)).toBe(true);
    });

    it('should return empty array if no sessions', async () => {
      const sessions = await repository.findByProfileId('non-existent-profile');
      expect(sessions).toEqual([]);
    });
  });

  describe('findByDateRange', () => {
    it('should return sessions within date range', async () => {
      const now = new Date();
      const yesterday = subDays(now, 1);
      const twoDaysAgo = subDays(now, 2);
      const threeDaysAgo = subDays(now, 3);

      // Create sessions at different dates
      await repository.create({
        profileId: 'profile-123',
        startedAt: threeDaysAgo,
        completedAt: threeDaysAgo,
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      await repository.create({
        profileId: 'profile-123',
        startedAt: yesterday,
        completedAt: yesterday,
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      await repository.create({
        profileId: 'profile-123',
        startedAt: now,
        completedAt: now,
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      const sessions = await repository.findByDateRange(
        startOfDay(twoDaysAgo),
        endOfDay(yesterday)
      );

      expect(sessions).toHaveLength(1);
      expect(sessions[0].startedAt.getTime()).toBeGreaterThanOrEqual(startOfDay(twoDaysAgo).getTime());
      expect(sessions[0].startedAt.getTime()).toBeLessThanOrEqual(endOfDay(yesterday).getTime());
    });

    it('should exclude sessions outside range', async () => {
      const now = new Date();
      const yesterday = subDays(now, 1);
      const twoDaysAgo = subDays(now, 2);
      const fourDaysAgo = subDays(now, 4);

      // Create sessions outside the range
      await repository.create({
        profileId: 'profile-123',
        startedAt: fourDaysAgo,
        completedAt: fourDaysAgo,
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      await repository.create({
        profileId: 'profile-123',
        startedAt: now,
        completedAt: now,
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      const sessions = await repository.findByDateRange(
        startOfDay(twoDaysAgo),
        endOfDay(yesterday)
      );

      expect(sessions).toHaveLength(0);
    });
  });

  describe('findToday', () => {
    it('should return only today\'s sessions', async () => {
      const now = new Date();
      const yesterday = subDays(now, 1);
      const tomorrow = new Date(now.getTime() + 86400000);

      // Create sessions for different days
      await repository.create({
        profileId: 'profile-123',
        startedAt: yesterday,
        completedAt: yesterday,
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      await repository.create({
        profileId: 'profile-123',
        startedAt: now,
        completedAt: now,
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      await repository.create({
        profileId: 'profile-123',
        startedAt: addHours(now, -1), // Earlier today
        completedAt: addHours(now, -1),
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      const sessions = await repository.findToday();

      expect(sessions).toHaveLength(2);
      sessions.forEach(session => {
        expect(session.startedAt.getTime()).toBeGreaterThanOrEqual(startOfDay(now).getTime());
        expect(session.startedAt.getTime()).toBeLessThanOrEqual(endOfDay(now).getTime());
      });
    });
  });

  describe('getStatistics', () => {
    it('should calculate correct total sessions', async () => {
      // Create multiple sessions
      for (let i = 0; i < 5; i++) {
        await repository.create({
          profileId: 'profile-123',
          startedAt: new Date(),
          completedAt: new Date(),
          plannedDurationMinutes: 25,
          actualDurationMinutes: i < 3 ? 25 : 15, // 3 completed, 2 stopped early
          completionStatus: i < 3 ? SessionStatus.COMPLETED : SessionStatus.STOPPED,
          pauseCount: 0,
          totalPauseDurationMinutes: 0,
        });
      }

      const stats = await repository.getStatistics();
      expect(stats.totalSessions).toBe(5);
    });

    it('should calculate correct completion rate', async () => {
      // Create sessions with different completion statuses
      await repository.create({
        profileId: 'profile-123',
        startedAt: new Date(),
        completedAt: new Date(),
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      await repository.create({
        profileId: 'profile-123',
        startedAt: new Date(),
        completedAt: new Date(),
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      await repository.create({
        profileId: 'profile-123',
        startedAt: new Date(),
        completedAt: new Date(),
        plannedDurationMinutes: 25,
        actualDurationMinutes: 15,
        completionStatus: SessionStatus.STOPPED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      await repository.create({
        profileId: 'profile-123',
        startedAt: new Date(),
        completedAt: null,
        plannedDurationMinutes: 25,
        actualDurationMinutes: 10,
        completionStatus: SessionStatus.INTERRUPTED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      const stats = await repository.getStatistics();
      expect(stats.completedSessions).toBe(2);
      expect(stats.completionRate).toBeCloseTo(0.5, 3); // 2/4 = 0.5
    });

    it('should calculate correct average duration', async () => {
      // Create completed sessions with different durations
      await repository.create({
        profileId: 'profile-123',
        startedAt: new Date(),
        completedAt: new Date(),
        plannedDurationMinutes: 25,
        actualDurationMinutes: 20,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      await repository.create({
        profileId: 'profile-123',
        startedAt: new Date(),
        completedAt: new Date(),
        plannedDurationMinutes: 25,
        actualDurationMinutes: 30,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      await repository.create({
        profileId: 'profile-123',
        startedAt: new Date(),
        completedAt: new Date(),
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      // Add a stopped session (shouldn't be included in average)
      await repository.create({
        profileId: 'profile-123',
        startedAt: new Date(),
        completedAt: null,
        plannedDurationMinutes: 25,
        actualDurationMinutes: 10,
        completionStatus: SessionStatus.STOPPED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      const stats = await repository.getStatistics();
      expect(stats.averageDurationMinutes).toBe(25); // (20+30+25)/3 = 25
      expect(stats.totalMinutes).toBe(75); // Only completed sessions
    });

    it('should identify most productive hour', async () => {
      const baseDate = new Date(2025, 8, 30, 0, 0, 0); // Start at midnight

      // Create sessions at different hours
      // 3 sessions at 9am
      for (let i = 0; i < 3; i++) {
        await repository.create({
          profileId: 'profile-123',
          startedAt: new Date(2025, 8, 30, 9, 0, 0),
          completedAt: new Date(2025, 8, 30, 9, 25, 0),
          plannedDurationMinutes: 25,
          actualDurationMinutes: 25,
          completionStatus: SessionStatus.COMPLETED,
          pauseCount: 0,
          totalPauseDurationMinutes: 0,
        });
      }

      // 2 sessions at 2pm
      for (let i = 0; i < 2; i++) {
        await repository.create({
          profileId: 'profile-123',
          startedAt: new Date(2025, 8, 30, 14, 0, 0),
          completedAt: new Date(2025, 8, 30, 14, 25, 0),
          plannedDurationMinutes: 25,
          actualDurationMinutes: 25,
          completionStatus: SessionStatus.COMPLETED,
          pauseCount: 0,
          totalPauseDurationMinutes: 0,
        });
      }

      // 1 session at 8pm
      await repository.create({
        profileId: 'profile-123',
        startedAt: new Date(2025, 8, 30, 20, 0, 0),
        completedAt: new Date(2025, 8, 30, 20, 25, 0),
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      const stats = await repository.getStatistics();
      expect(stats.mostProductiveHour).toBe(9); // 9am has the most sessions
    });

    it('should calculate streak correctly', async () => {
      const now = new Date();

      // Create sessions for consecutive days (current streak of 3)
      await repository.create({
        profileId: 'profile-123',
        startedAt: subDays(now, 2),
        completedAt: subDays(now, 2),
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      await repository.create({
        profileId: 'profile-123',
        startedAt: subDays(now, 1),
        completedAt: subDays(now, 1),
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      await repository.create({
        profileId: 'profile-123',
        startedAt: now,
        completedAt: now,
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      // Break in streak (5 days ago)
      await repository.create({
        profileId: 'profile-123',
        startedAt: subDays(now, 5),
        completedAt: subDays(now, 5),
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      const stats = await repository.getStatistics();
      expect(stats.currentStreak).toBe(3);
      expect(stats.longestStreak).toBe(3);
    });

    it('should filter by profile', async () => {
      // Create sessions for different profiles
      await repository.create({
        profileId: 'profile-123',
        startedAt: new Date(),
        completedAt: new Date(),
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      await repository.create({
        profileId: 'profile-123',
        startedAt: new Date(),
        completedAt: new Date(),
        plannedDurationMinutes: 30,
        actualDurationMinutes: 30,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      await repository.create({
        profileId: 'profile-456',
        startedAt: new Date(),
        completedAt: new Date(),
        plannedDurationMinutes: 50,
        actualDurationMinutes: 50,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      const stats = await repository.getStatistics('profile-123');

      expect(stats.totalSessions).toBe(2);
      expect(stats.completedSessions).toBe(2);
      expect(stats.totalMinutes).toBe(55); // 25 + 30
      expect(stats.averageDurationMinutes).toBe(27.5); // (25 + 30) / 2
    });
  });

  describe('getStatisticsForRange', () => {
    it('should calculate stats for date range', async () => {
      const now = new Date();
      const yesterday = subDays(now, 1);
      const threeDaysAgo = subDays(now, 3);

      // Create sessions across different days
      await repository.create({
        profileId: 'profile-123',
        startedAt: threeDaysAgo,
        completedAt: threeDaysAgo,
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      await repository.create({
        profileId: 'profile-123',
        startedAt: yesterday,
        completedAt: yesterday,
        plannedDurationMinutes: 30,
        actualDurationMinutes: 30,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      await repository.create({
        profileId: 'profile-123',
        startedAt: now,
        completedAt: now,
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      // Get statistics for yesterday to today
      const stats = await repository.getStatisticsForRange(
        startOfDay(yesterday),
        endOfDay(now)
      );

      expect(stats.totalSessions).toBe(2);
      expect(stats.completedSessions).toBe(2);
      expect(stats.totalMinutes).toBe(55); // 30 + 25
      expect(stats.averageDurationMinutes).toBe(27.5);
    });
  });

  describe('deleteOlderThan', () => {
    it('should delete old sessions and return count', async () => {
      const now = new Date();
      const yesterday = subDays(now, 1);
      const threeDaysAgo = subDays(now, 3);
      const fiveDaysAgo = subDays(now, 5);

      // Create sessions at different dates
      await repository.create({
        profileId: 'profile-123',
        startedAt: fiveDaysAgo,
        completedAt: fiveDaysAgo,
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      await repository.create({
        profileId: 'profile-123',
        startedAt: threeDaysAgo,
        completedAt: threeDaysAgo,
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      await repository.create({
        profileId: 'profile-123',
        startedAt: yesterday,
        completedAt: yesterday,
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      // Delete sessions older than 2 days
      const deletedCount = await repository.deleteOlderThan(subDays(now, 2));

      expect(deletedCount).toBe(2); // Sessions from 3 and 5 days ago
    });

    it('should not delete newer sessions', async () => {
      const now = new Date();
      const yesterday = subDays(now, 1);
      const twoDaysAgo = subDays(now, 2);

      // Create recent sessions
      const session1 = await repository.create({
        profileId: 'profile-123',
        startedAt: yesterday,
        completedAt: yesterday,
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      const session2 = await repository.create({
        profileId: 'profile-123',
        startedAt: now,
        completedAt: now,
        plannedDurationMinutes: 25,
        actualDurationMinutes: 25,
        completionStatus: SessionStatus.COMPLETED,
        pauseCount: 0,
        totalPauseDurationMinutes: 0,
      });

      // Delete sessions older than 2 days (should delete none)
      const deletedCount = await repository.deleteOlderThan(twoDaysAgo);

      expect(deletedCount).toBe(0);

      // Verify sessions still exist
      const found1 = await repository.findById(session1.id);
      const found2 = await repository.findById(session2.id);
      expect(found1).not.toBeNull();
      expect(found2).not.toBeNull();
    });
  });
});