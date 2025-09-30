// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/hooks/useSessionPersistence.ts
// Description: React hook for managing timer session persistence and analytics
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { useState, useEffect, useCallback } from 'react';
import { sessionPersistenceService, TimerSession, SessionStatistics } from '@/services/storage/SessionPersistenceService';

interface SessionPersistenceState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  recentSessions: TimerSession[];
  statistics: SessionStatistics | null;
}

interface SessionPersistenceActions {
  saveSession: (sessionData: Omit<TimerSession, 'sessionId' | 'createdAt' | 'syncStatus'>) => Promise<string>;
  loadRecentSessions: (limit?: number) => Promise<void>;
  loadStatistics: () => Promise<void>;
  getSessionsByDateRange: (startDate: Date, endDate: Date, profileId?: string) => Promise<TimerSession[]>;
  clearAllData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

interface UseSessionPersistenceResult {
  state: SessionPersistenceState;
  actions: SessionPersistenceActions;
}

export const useSessionPersistence = (): UseSessionPersistenceResult => {
  const [state, setState] = useState<SessionPersistenceState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    recentSessions: [],
    statistics: null,
  });

  // Initialize database on hook mount
  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await sessionPersistenceService.initializeDatabase();

      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        error: null,
      }));

      // Load initial data
      await loadInitialData();

    } catch (error) {
      console.error('Failed to initialize session persistence:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Initialization failed',
      }));
    }
  };

  const loadInitialData = async () => {
    try {
      // Load recent sessions and statistics in parallel
      const [sessions, stats] = await Promise.all([
        sessionPersistenceService.getRecentTimerSessions(20),
        sessionPersistenceService.getSessionStatistics()
      ]);

      setState(prev => ({
        ...prev,
        recentSessions: sessions,
        statistics: stats,
      }));

    } catch (error) {
      console.error('Failed to load initial session data:', error);
    }
  };

  const saveSession = useCallback(async (
    sessionData: Omit<TimerSession, 'sessionId' | 'createdAt' | 'syncStatus'>
  ): Promise<string> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const sessionId = await sessionPersistenceService.saveTimerSession(sessionData);

      // Refresh recent sessions and statistics after saving
      await loadInitialData();

      setState(prev => ({ ...prev, isLoading: false }));

      console.log('Session saved successfully:', sessionId);
      return sessionId;

    } catch (error) {
      console.error('Failed to save session:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to save session',
      }));
      throw error;
    }
  }, []);

  const loadRecentSessions = useCallback(async (limit: number = 50): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const sessions = await sessionPersistenceService.getRecentTimerSessions(limit);

      setState(prev => ({
        ...prev,
        recentSessions: sessions,
        isLoading: false,
      }));

    } catch (error) {
      console.error('Failed to load recent sessions:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load sessions',
      }));
    }
  }, []);

  const loadStatistics = useCallback(async (): Promise<void> => {
    try {
      const stats = await sessionPersistenceService.getSessionStatistics();

      setState(prev => ({
        ...prev,
        statistics: stats,
      }));

    } catch (error) {
      console.error('Failed to load statistics:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load statistics',
      }));
    }
  }, []);

  const getSessionsByDateRange = useCallback(async (
    startDate: Date,
    endDate: Date,
    profileId?: string
  ): Promise<TimerSession[]> => {
    try {
      return await sessionPersistenceService.getSessionsByDateRange(startDate, endDate, profileId);
    } catch (error) {
      console.error('Failed to get sessions by date range:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get sessions',
      }));
      return [];
    }
  }, []);

  const clearAllData = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await sessionPersistenceService.clearAllSessionData();

      setState(prev => ({
        ...prev,
        recentSessions: [],
        statistics: null,
        isLoading: false,
      }));

      console.log('All session data cleared successfully');

    } catch (error) {
      console.error('Failed to clear session data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to clear data',
      }));
    }
  }, []);

  const refreshData = useCallback(async (): Promise<void> => {
    await loadInitialData();
  }, []);

  const actions: SessionPersistenceActions = {
    saveSession,
    loadRecentSessions,
    loadStatistics,
    getSessionsByDateRange,
    clearAllData,
    refreshData,
  };

  return {
    state,
    actions,
  };
};

// Utility hook for tracking current session
export const useCurrentSession = () => {
  const [currentSession, setCurrentSession] = useState<{
    sessionId: string | null;
    startTime: number | null;
    profileId: string | null;
    profileName: string | null;
    plannedDurationSeconds: number | null;
    interruptions: number;
  }>({
    sessionId: null,
    startTime: null,
    profileId: null,
    profileName: null,
    plannedDurationSeconds: null,
    interruptions: 0,
  });

  const startSession = useCallback((
    profileId: string,
    profileName: string,
    plannedDurationSeconds: number
  ) => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    setCurrentSession({
      sessionId,
      startTime,
      profileId,
      profileName,
      plannedDurationSeconds,
      interruptions: 0,
    });

    console.log('Session started:', sessionId, profileName);
    return sessionId;
  }, []);

  const addInterruption = useCallback(() => {
    setCurrentSession(prev => ({
      ...prev,
      interruptions: prev.interruptions + 1,
    }));
  }, []);

  const endSession = useCallback((
    completionStatus: 'completed' | 'paused' | 'cancelled' | 'interrupted',
    actualDurationSeconds: number
  ) => {
    const session = currentSession;
    if (!session.sessionId || !session.startTime) {
      console.warn('No active session to end');
      return null;
    }

    const sessionData = {
      profileId: session.profileId!,
      profileName: session.profileName!,
      plannedDurationSeconds: session.plannedDurationSeconds!,
      actualDurationSeconds,
      completionStatus,
      startTimestamp: session.startTime,
      endTimestamp: Date.now(),
      interruptions: session.interruptions,
    };

    // Clear current session
    setCurrentSession({
      sessionId: null,
      startTime: null,
      profileId: null,
      profileName: null,
      plannedDurationSeconds: null,
      interruptions: 0,
    });

    console.log('Session ended:', session.sessionId, completionStatus);
    return sessionData;
  }, [currentSession]);

  return {
    currentSession,
    startSession,
    addInterruption,
    endSession,
    isSessionActive: !!currentSession.sessionId,
  };
};