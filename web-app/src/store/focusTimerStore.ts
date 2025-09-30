// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/store/focusTimerStore.ts
// Description: Zustand store for focus timer state management with seconds-level precision for all activities
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { create } from 'zustand';
import { FocusTimerEngine } from '@/services/timer/FocusTimerEngine';
import { TimerData, TimerState, TimerEvent } from '@/types/timer.types';
import { Profile } from '@/types/profile.types';

interface FocusTimerStore {
  // State
  currentTimerData: TimerData;
  activeTimerProfile: Profile | null;
  focusTimerEngine: FocusTimerEngine | null;

  // Timer Duration Actions (seconds for precision)
  initializeTimerWithSeconds: (durationInSeconds: number) => void;
  initializeTimerWithMinutes: (durationInMinutes: number) => void;

  // Timer Control Actions
  startFocusSession: () => void;
  pauseFocusSession: () => void;
  resumeFocusSession: () => void;
  stopFocusSession: () => void;
  resetFocusTimer: () => void;

  // Profile Management
  setActiveTimerProfile: (profile: Profile | null) => void;

  // Display Helpers
  getFormattedTimeDisplay: () => string;
  getSessionProgressPercentage: () => number;
  getRemainingTimeInSeconds: () => number;
}

export const useFocusTimerStore = create<FocusTimerStore>((set, get) => ({
  // Initial state
  currentTimerData: {
    state: TimerState.IDLE,
    totalSeconds: 1500, // Default 25 minutes
    remainingSeconds: 1500,
    progress: 0
  },
  activeTimerProfile: null,
  focusTimerEngine: null,

  // Initialize timer with seconds for exercises and custom intervals
  initializeTimerWithSeconds: (durationInSeconds: number) => {
    const existingEngine = get().focusTimerEngine;
    if (existingEngine) {
      existingEngine.destroyTimer();
    }

    const newTimerEngine = new FocusTimerEngine(durationInSeconds);

    // Subscribe to timer updates for UI reactivity
    newTimerEngine.subscribeToTimerUpdates((timerData: TimerData, timerEvent: TimerEvent) => {
      set({ currentTimerData: timerData });

      // Handle completion with celebration
      if (timerEvent === TimerEvent.COMPLETE) {
        console.log('🎉 Focus session completed successfully!');
        // Here we would trigger notification, haptic feedback, etc.
      }
    });

    set({
      focusTimerEngine: newTimerEngine,
      currentTimerData: newTimerEngine.getCurrentTimerState()
    });
  },

  // Initialize timer with minutes for convenience
  initializeTimerWithMinutes: (durationInMinutes: number) => {
    get().initializeTimerWithSeconds(durationInMinutes * 60);
  },

  // Start a new focus session
  startFocusSession: () => {
    const engine = get().focusTimerEngine;
    if (!engine) {
      // Default to 25 minutes if no engine exists
      get().initializeTimerWithMinutes(25);
    }
    get().focusTimerEngine?.startFocusTimer();
  },

  // Pause current focus session
  pauseFocusSession: () => {
    get().focusTimerEngine?.pauseTimer();
  },

  // Resume paused focus session
  resumeFocusSession: () => {
    get().focusTimerEngine?.resumeTimer();
  },

  // Stop and end focus session
  stopFocusSession: () => {
    get().focusTimerEngine?.stopTimer();
  },

  // Reset timer to initial duration
  resetFocusTimer: () => {
    get().focusTimerEngine?.resetTimer();
  },

  // Set active profile and update timer duration
  setActiveTimerProfile: (profile: Profile | null) => {
    set({ activeTimerProfile: profile });
    if (profile) {
      // Convert profile minutes to seconds for timer
      get().initializeTimerWithMinutes(profile.durationMinutes);
    }
  },

  // Get formatted time for display (MM:SS or HH:MM:SS)
  getFormattedTimeDisplay: () => {
    const { remainingSeconds } = get().currentTimerData;
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  },

  // Get progress percentage for circular indicator
  getSessionProgressPercentage: () => {
    return Math.round(get().currentTimerData.progress * 100);
  },

  // Get remaining seconds for precise tracking
  getRemainingTimeInSeconds: () => {
    return get().currentTimerData.remainingSeconds;
  }
}));