// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/components/timer/TimerDisplay.tsx
// Description: Main timer display component with circular progress indicator and control buttons
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

'use client';

import React, { useEffect } from 'react';
import { useTimerStore } from '@/store/timerStore';
import { TimerState } from '@/types/timer.types';

export default function TimerDisplay() {
  const {
    timerData,
    activeProfile,
    initializeTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    getFormattedTime,
    getProgressPercentage
  } = useTimerStore();

  // Initialize timer on mount
  useEffect(() => {
    initializeTimer(25); // Default 25 minutes
  }, []);

  const progress = getProgressPercentage();
  const timeDisplay = getFormattedTime();

  // Calculate stroke dash for circular progress
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Determine which buttons to show based on state
  const renderControls = () => {
    switch (timerData.state) {
      case TimerState.IDLE:
        return (
          <button
            onClick={startTimer}
            className="px-8 py-4 bg-blue-500 text-white rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors"
            data-testid="start-button"
          >
            Start Focus
          </button>
        );

      case TimerState.RUNNING:
        return (
          <button
            onClick={pauseTimer}
            className="px-8 py-4 bg-yellow-500 text-white rounded-full text-lg font-semibold hover:bg-yellow-600 transition-colors"
            data-testid="pause-button"
          >
            Pause
          </button>
        );

      case TimerState.PAUSED:
        return (
          <div className="flex gap-4">
            <button
              onClick={resumeTimer}
              className="px-8 py-4 bg-green-500 text-white rounded-full text-lg font-semibold hover:bg-green-600 transition-colors"
              data-testid="resume-button"
            >
              Resume
            </button>
            <button
              onClick={stopTimer}
              className="px-6 py-4 bg-red-500 text-white rounded-full text-lg font-semibold hover:bg-red-600 transition-colors"
              data-testid="stop-button"
            >
              Stop
            </button>
          </div>
        );

      case TimerState.STOPPED:
      case TimerState.COMPLETED:
        return (
          <button
            onClick={resetTimer}
            className="px-8 py-4 bg-gray-500 text-white rounded-full text-lg font-semibold hover:bg-gray-600 transition-colors"
            data-testid="reset-button"
          >
            Reset Timer
          </button>
        );

      default:
        return null;
    }
  };

  const getStateColor = () => {
    switch (timerData.state) {
      case TimerState.RUNNING:
        return '#3B82F6'; // blue-500
      case TimerState.PAUSED:
        return '#EAB308'; // yellow-500
      case TimerState.COMPLETED:
        return '#10B981'; // green-500
      default:
        return '#6B7280'; // gray-500
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* Profile Name */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeProfile?.name || 'Focus Timer'}
          </h2>
          {activeProfile?.description && (
            <p className="text-gray-600 mt-2">{activeProfile.description}</p>
          )}
        </div>

        {/* Circular Timer Display */}
        <div className="relative w-72 h-72 mx-auto mb-8">
          <svg className="transform -rotate-90 w-72 h-72">
            {/* Background circle */}
            <circle
              cx="144"
              cy="144"
              r={radius}
              stroke="#E5E7EB"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="144"
              cy="144"
              r={radius}
              stroke={getStateColor()}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 ease-linear"
              data-testid="progress-circle"
            />
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="text-6xl font-bold text-gray-800 tabular-nums"
              data-testid="time-display"
            >
              {timeDisplay}
            </div>
            <div className="text-lg text-gray-600 mt-2">
              {progress}% complete
            </div>
            {timerData.state === TimerState.COMPLETED && (
              <div className="text-green-500 font-semibold mt-2">
                Well done! 🎉
              </div>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center" data-testid="timer-controls">
          {renderControls()}
        </div>

        {/* State Indicator */}
        <div className="text-center mt-6">
          <span className="text-sm text-gray-500">
            Status: {' '}
            <span className="font-semibold capitalize">
              {timerData.state.toLowerCase()}
            </span>
          </span>
        </div>
      </div>

      {/* Quick Duration Buttons */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => initializeTimer(5)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          data-testid="duration-5"
        >
          5 min
        </button>
        <button
          onClick={() => initializeTimer(15)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          data-testid="duration-15"
        >
          15 min
        </button>
        <button
          onClick={() => initializeTimer(25)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          data-testid="duration-25"
        >
          25 min
        </button>
        <button
          onClick={() => initializeTimer(45)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          data-testid="duration-45"
        >
          45 min
        </button>
      </div>
    </div>
  );
}