// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/services/timer/TimerEngine.ts
// Description: Core timer engine implementation for managing countdown timer state and operations
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import {
  ITimerController,
  TimerData,
  TimerState,
  TimerStateChangeListener,
  TimerEvent
} from '@/types/timer.types';

/**
 * Timer Engine Implementation
 * Manages timer state and countdown operations
 */
export class TimerEngine implements ITimerController {
  private state: TimerState = TimerState.IDLE;
  private totalSeconds: number = 0;
  private remainingSeconds: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private listeners: Set<TimerStateChangeListener> = new Set();
  private startTime: number | null = null;
  private pausedTime: number = 0;

  constructor(durationMinutes: number = 25) {
    this.setDuration(durationMinutes);
  }

  /**
   * Set timer duration in minutes
   */
  public setDuration(minutes: number): void {
    this.totalSeconds = minutes * 60;
    this.remainingSeconds = this.totalSeconds;
    this.notifyListeners(TimerEvent.RESET);
  }

  /**
   * Start the timer
   */
  public start(): void {
    if (this.state === TimerState.RUNNING) return;

    this.state = TimerState.RUNNING;
    this.startTime = Date.now() - (this.totalSeconds - this.remainingSeconds) * 1000;

    this.intervalId = setInterval(() => {
      this.tick();
    }, 100); // Check every 100ms for accuracy

    this.notifyListeners(TimerEvent.START);
  }

  /**
   * Pause the timer
   */
  public pause(): void {
    if (this.state !== TimerState.RUNNING) return;

    this.state = TimerState.PAUSED;
    this.pausedTime = Date.now();

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.notifyListeners(TimerEvent.PAUSE);
  }

  /**
   * Resume the timer from paused state
   */
  public resume(): void {
    if (this.state !== TimerState.PAUSED) return;

    if (this.pausedTime && this.startTime) {
      const pauseDuration = Date.now() - this.pausedTime;
      this.startTime += pauseDuration;
    }

    this.start();
    this.notifyListeners(TimerEvent.RESUME);
  }

  /**
   * Stop the timer
   */
  public stop(): void {
    this.state = TimerState.STOPPED;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.notifyListeners(TimerEvent.STOP);
  }

  /**
   * Reset the timer to initial state
   */
  public reset(): void {
    this.stop();
    this.state = TimerState.IDLE;
    this.remainingSeconds = this.totalSeconds;
    this.startTime = null;
    this.pausedTime = 0;
    this.notifyListeners(TimerEvent.RESET);
  }

  /**
   * Get current timer state data
   */
  public getState(): TimerData {
    return {
      state: this.state,
      totalSeconds: this.totalSeconds,
      remainingSeconds: this.remainingSeconds,
      progress: this.totalSeconds > 0
        ? (this.totalSeconds - this.remainingSeconds) / this.totalSeconds
        : 0
    };
  }

  /**
   * Subscribe to timer state changes
   */
  public subscribe(listener: TimerStateChangeListener): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Handle timer tick
   */
  private tick(): void {
    if (this.state !== TimerState.RUNNING || !this.startTime) return;

    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const newRemaining = Math.max(0, this.totalSeconds - elapsed);

    // Only update if seconds changed
    if (newRemaining !== this.remainingSeconds) {
      this.remainingSeconds = newRemaining;
      this.notifyListeners(TimerEvent.TICK);

      if (this.remainingSeconds === 0) {
        this.complete();
      }
    }
  }

  /**
   * Handle timer completion
   */
  private complete(): void {
    this.state = TimerState.COMPLETED;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.notifyListeners(TimerEvent.COMPLETE);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(event: TimerEvent): void {
    const data = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(data, event);
      } catch (error) {
        console.error('Error in timer listener:', error);
      }
    });
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.stop();
    this.listeners.clear();
  }
}