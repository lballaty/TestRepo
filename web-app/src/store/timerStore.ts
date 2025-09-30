// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/store/timerStore.ts
// Description: Zustand store for timer state management connecting timer engine to UI components
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { create } from 'zustand';
import { TimerEngine } from '@/services/timer/TimerEngine';
import { TimerData, TimerState, TimerEvent } from '@/types/timer.types';
import { Profile } from '@/types/profile.types';

interface TimerStore {
  // State
  timerData: TimerData;
  activeProfile: Profile | null;
  timerEngine: TimerEngine | null;

  // Actions
  initializeTimer: (durationMinutes: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  setActiveProfile: (profile: Profile | null) => void;

  // Computed
  getFormattedTime: () => string;
  getProgressPercentage: () => number;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  // Initial state
  timerData: {
    state: TimerState.IDLE,
    totalSeconds: 1500, // Default 25 minutes
    remainingSeconds: 1500,
    progress: 0
  },
  activeProfile: null,
  timerEngine: null,

  // Initialize timer with duration
  initializeTimer: (durationMinutes: number) => {
    const currentEngine = get().timerEngine;
    if (currentEngine) {
      currentEngine.destroy();
    }

    const newEngine = new TimerEngine(durationMinutes);

    // Subscribe to timer updates
    newEngine.subscribe((data: TimerData, event: TimerEvent) => {
      set({ timerData: data });

      // Handle completion
      if (event === TimerEvent.COMPLETE) {
        // Could trigger notification here
        console.log('Timer completed!');
      }
    });

    set({
      timerEngine: newEngine,
      timerData: newEngine.getState()
    });
  },

  // Timer control actions
  startTimer: () => {
    const engine = get().timerEngine;
    if (!engine) {
      get().initializeTimer(25); // Default 25 minutes
    }
    get().timerEngine?.start();
  },

  pauseTimer: () => {
    get().timerEngine?.pause();
  },

  resumeTimer: () => {
    get().timerEngine?.resume();
  },

  stopTimer: () => {
    get().timerEngine?.stop();
  },

  resetTimer: () => {
    get().timerEngine?.reset();
  },

  setActiveProfile: (profile: Profile | null) => {
    set({ activeProfile: profile });
    if (profile) {
      get().initializeTimer(profile.durationMinutes);
    }
  },

  // Computed values
  getFormattedTime: () => {
    const { remainingSeconds } = get().timerData;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },

  getProgressPercentage: () => {
    return Math.round(get().timerData.progress * 100);
  }
}));