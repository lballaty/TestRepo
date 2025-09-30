// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/public/timer-worker.js
// Description: Web Worker for accurate timer operation in background on iOS devices
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

let timerIntervalId = null;
let remainingMilliseconds = 0;
let lastTickTimestamp = 0;
let isPaused = true;

// Handle messages from main thread
self.addEventListener('message', (event) => {
  const { command, payload } = event.data;

  switch (command) {
    case 'START_BACKGROUND_TIMER':
      startBackgroundTimer(payload.durationSeconds);
      break;

    case 'PAUSE_BACKGROUND_TIMER':
      pauseBackgroundTimer();
      break;

    case 'RESUME_BACKGROUND_TIMER':
      resumeBackgroundTimer();
      break;

    case 'STOP_BACKGROUND_TIMER':
      stopBackgroundTimer();
      break;

    case 'SET_TIMER_DURATION':
      setTimerDuration(payload.durationSeconds);
      break;

    case 'GET_TIMER_STATUS':
      sendTimerStatus();
      break;

    default:
      console.warn('Unknown command received by timer worker:', command);
  }
});

/**
 * Start the background timer with specified duration
 * @param {number} durationSeconds - Timer duration in seconds
 */
function startBackgroundTimer(durationSeconds) {
  remainingMilliseconds = durationSeconds * 1000;
  lastTickTimestamp = Date.now();
  isPaused = false;

  // Clear any existing interval
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
  }

  // Start high-frequency interval for accurate timing
  timerIntervalId = setInterval(updateTimerTick, 100); // Update every 100ms

  // Send initial status
  sendTimerStatus();
}

/**
 * Update timer tick and check for completion
 */
function updateTimerTick() {
  if (isPaused) return;

  const currentTimestamp = Date.now();
  const elapsedMilliseconds = currentTimestamp - lastTickTimestamp;
  lastTickTimestamp = currentTimestamp;

  remainingMilliseconds = Math.max(0, remainingMilliseconds - elapsedMilliseconds);

  // Send update to main thread
  self.postMessage({
    type: 'TIMER_TICK',
    payload: {
      remainingSeconds: Math.ceil(remainingMilliseconds / 1000),
      remainingMilliseconds: remainingMilliseconds,
      isRunning: !isPaused,
      isComplete: remainingMilliseconds === 0
    }
  });

  // Handle timer completion
  if (remainingMilliseconds === 0) {
    handleTimerCompletion();
  }
}

/**
 * Pause the background timer
 */
function pauseBackgroundTimer() {
  isPaused = true;
  sendTimerStatus();
}

/**
 * Resume the background timer from paused state
 */
function resumeBackgroundTimer() {
  if (remainingMilliseconds > 0) {
    isPaused = false;
    lastTickTimestamp = Date.now();

    // Restart interval if needed
    if (!timerIntervalId) {
      timerIntervalId = setInterval(updateTimerTick, 100);
    }

    sendTimerStatus();
  }
}

/**
 * Stop the background timer completely
 */
function stopBackgroundTimer() {
  isPaused = true;
  remainingMilliseconds = 0;

  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }

  sendTimerStatus();
}

/**
 * Set new timer duration without starting
 * @param {number} durationSeconds - New duration in seconds
 */
function setTimerDuration(durationSeconds) {
  if (isPaused) {
    remainingMilliseconds = durationSeconds * 1000;
    sendTimerStatus();
  }
}

/**
 * Send current timer status to main thread
 */
function sendTimerStatus() {
  self.postMessage({
    type: 'TIMER_STATUS',
    payload: {
      remainingSeconds: Math.ceil(remainingMilliseconds / 1000),
      remainingMilliseconds: remainingMilliseconds,
      isRunning: !isPaused,
      isComplete: remainingMilliseconds === 0
    }
  });
}

/**
 * Handle timer completion
 */
function handleTimerCompletion() {
  isPaused = true;

  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }

  // Send completion notification
  self.postMessage({
    type: 'TIMER_COMPLETED',
    payload: {
      completedAt: new Date().toISOString()
    }
  });

  // Request notification permission if supported
  self.postMessage({
    type: 'REQUEST_COMPLETION_NOTIFICATION',
    payload: {
      title: 'Timer Completed!',
      body: 'Your focus session has finished.',
      requireInteraction: true
    }
  });
}

// Send ready signal when worker loads
self.postMessage({
  type: 'WORKER_READY',
  payload: {
    initialized: true
  }
});