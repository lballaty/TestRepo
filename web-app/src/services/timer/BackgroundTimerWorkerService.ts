// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/services/timer/BackgroundTimerWorkerService.ts
// Description: Service to manage Web Worker for background timer operation on iOS
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

export interface WorkerTimerStatus {
  remainingSeconds: number;
  remainingMilliseconds: number;
  isRunning: boolean;
  isComplete: boolean;
}

export interface WorkerMessageEvent {
  type: 'WORKER_READY' | 'TIMER_TICK' | 'TIMER_STATUS' | 'TIMER_COMPLETED' | 'REQUEST_COMPLETION_NOTIFICATION';
  payload: any;
}

type TimerUpdateCallback = (status: WorkerTimerStatus) => void;
type CompletionCallback = () => void;

/**
 * Service to manage Web Worker for background timer operation
 * Ensures timer continues running accurately even when app is backgrounded on iOS
 */
export class BackgroundTimerWorkerService {
  private worker: Worker | null = null;
  private updateCallbacks: Set<TimerUpdateCallback> = new Set();
  private completionCallbacks: Set<CompletionCallback> = new Set();
  private isWorkerReady: boolean = false;
  private pendingCommands: Array<{ command: string; payload?: any }> = [];

  constructor() {
    this.initializeWorker();
  }

  /**
   * Initialize the Web Worker for background timer operation
   */
  private initializeWorker(): void {
    try {
      // Create worker from public directory
      this.worker = new Worker('/timer-worker.js');

      // Set up message handler
      this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));

      // Set up error handler
      this.worker.addEventListener('error', this.handleWorkerError.bind(this));

    } catch (error) {
      console.error('Failed to initialize timer worker:', error);
      // Fall back to main thread timer if worker fails
      this.isWorkerReady = false;
    }
  }

  /**
   * Handle messages from the Web Worker
   */
  private handleWorkerMessage(event: MessageEvent<WorkerMessageEvent>): void {
    const { type, payload } = event.data;

    switch (type) {
      case 'WORKER_READY':
        this.handleWorkerReady();
        break;

      case 'TIMER_TICK':
      case 'TIMER_STATUS':
        this.notifyTimerUpdate(payload as WorkerTimerStatus);
        break;

      case 'TIMER_COMPLETED':
        this.handleTimerCompletion();
        break;

      case 'REQUEST_COMPLETION_NOTIFICATION':
        this.showCompletionNotification(payload);
        break;
    }
  }

  /**
   * Handle worker initialization complete
   */
  private handleWorkerReady(): void {
    this.isWorkerReady = true;

    // Process any pending commands
    while (this.pendingCommands.length > 0) {
      const command = this.pendingCommands.shift();
      if (command) {
        this.sendCommandToWorker(command.command, command.payload);
      }
    }
  }

  /**
   * Handle worker errors
   */
  private handleWorkerError(error: ErrorEvent): void {
    console.error('Timer worker error:', error);
    // Could implement fallback to main thread timer here
  }

  /**
   * Send command to the Web Worker
   */
  private sendCommandToWorker(command: string, payload?: any): void {
    if (!this.worker) {
      console.error('Worker not initialized');
      return;
    }

    if (!this.isWorkerReady) {
      // Queue command if worker not ready yet
      this.pendingCommands.push({ command, payload });
      return;
    }

    this.worker.postMessage({ command, payload });
  }

  /**
   * Start the background timer with specified duration
   */
  public startBackgroundTimer(durationSeconds: number): void {
    this.sendCommandToWorker('START_BACKGROUND_TIMER', { durationSeconds });
  }

  /**
   * Pause the background timer
   */
  public pauseBackgroundTimer(): void {
    this.sendCommandToWorker('PAUSE_BACKGROUND_TIMER');
  }

  /**
   * Resume the background timer from paused state
   */
  public resumeBackgroundTimer(): void {
    this.sendCommandToWorker('RESUME_BACKGROUND_TIMER');
  }

  /**
   * Stop the background timer completely
   */
  public stopBackgroundTimer(): void {
    this.sendCommandToWorker('STOP_BACKGROUND_TIMER');
  }

  /**
   * Set new timer duration without starting
   */
  public setTimerDuration(durationSeconds: number): void {
    this.sendCommandToWorker('SET_TIMER_DURATION', { durationSeconds });
  }

  /**
   * Request current timer status from worker
   */
  public requestTimerStatus(): void {
    this.sendCommandToWorker('GET_TIMER_STATUS');
  }

  /**
   * Subscribe to timer updates from worker
   */
  public subscribeToTimerUpdates(callback: TimerUpdateCallback): () => void {
    this.updateCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.updateCallbacks.delete(callback);
    };
  }

  /**
   * Subscribe to timer completion events
   */
  public subscribeToCompletion(callback: CompletionCallback): () => void {
    this.completionCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.completionCallbacks.delete(callback);
    };
  }

  /**
   * Notify all subscribers of timer update
   */
  private notifyTimerUpdate(status: WorkerTimerStatus): void {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in timer update callback:', error);
      }
    });
  }

  /**
   * Handle timer completion
   */
  private handleTimerCompletion(): void {
    this.completionCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in completion callback:', error);
      }
    });
  }

  /**
   * Show completion notification (if permissions granted)
   */
  private async showCompletionNotification(payload: any): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(payload.title, {
          body: payload.body,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          requireInteraction: payload.requireInteraction
        });
      } catch (error) {
        console.error('Failed to show notification:', error);
      }
    }
  }

  /**
   * Check if Web Worker is supported and ready
   */
  public isWorkerSupported(): boolean {
    return typeof Worker !== 'undefined' && this.isWorkerReady;
  }

  /**
   * Destroy the worker and clean up resources
   */
  public destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.updateCallbacks.clear();
    this.completionCallbacks.clear();
    this.pendingCommands = [];
    this.isWorkerReady = false;
  }
}

// Create singleton instance
let backgroundTimerServiceInstance: BackgroundTimerWorkerService | null = null;

/**
 * Get or create singleton instance of background timer service
 */
export function getBackgroundTimerService(): BackgroundTimerWorkerService {
  if (!backgroundTimerServiceInstance) {
    backgroundTimerServiceInstance = new BackgroundTimerWorkerService();
  }
  return backgroundTimerServiceInstance;
}