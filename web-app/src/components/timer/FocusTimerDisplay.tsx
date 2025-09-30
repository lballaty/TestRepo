// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/components/timer/FocusTimerDisplay.tsx
// Description: Main focus timer display component with circular progress, granular duration control, and exercise interval support
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

'use client';

import React, { useEffect, useState } from 'react';
import { useFocusTimerStore } from '@/store/focusTimerStore';
import { TimerState } from '@/types/timer.types';
import ProfileManager from '@/components/profiles/ProfileManager';
import PWAStatusIndicator from '@/components/pwa/PWAStatusIndicator';
import BreathingVisualizer from '@/components/breathing/BreathingVisualizer';
import { BREATHING_PATTERNS } from '@/data/breathing-patterns';

export default function FocusTimerDisplay() {
  const {
    currentTimerData,
    activeTimerProfile,
    initializeTimerWithSeconds,
    initializeTimerWithMinutes,
    startFocusSession,
    pauseFocusSession,
    resumeFocusSession,
    stopFocusSession,
    resetFocusTimer,
    getFormattedTimeDisplay,
    getSessionProgressPercentage
  } = useFocusTimerStore();

  // Local state for custom duration input
  const [customMinutes, setCustomMinutes] = useState(25);
  const [customSeconds, setCustomSeconds] = useState(0);
  const [showCustomDurationPanel, setShowCustomDurationPanel] = useState(false);
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [showBreathingMode, setShowBreathingMode] = useState(false);
  const [breathingPattern, setBreathingPattern] = useState(null);

  // Initialize timer on mount - load saved profile or default
  useEffect(() => {
    const initializeTimerFromProfile = () => {
      // Try to restore last selected profile
      const lastProfileId = localStorage.getItem('lastSelectedProfile');
      if (lastProfileId) {
        // Load default profiles to find the saved one
        const DEFAULT_PROFILES = [
          { id: 'pomodoro', name: 'Pomodoro', durationMinutes: 25, isDefault: true },
          { id: 'deep-work', name: 'Deep Work', durationMinutes: 90, isDefault: false },
          { id: 'exercise', name: 'Exercise Intervals', durationMinutes: 0.5, isDefault: false },
          { id: 'meditation', name: 'Meditation', durationMinutes: 10, isDefault: false },
          { id: 'rajio-taiso', name: 'Rajio Taiso', durationMinutes: 6, isDefault: false },
          { id: 'tai-chi-morning', name: 'Tai Chi Morning', durationMinutes: 15, isDefault: false },
          { id: 'shinrin-yoku', name: 'Shinrin-yoku', durationMinutes: 20, isDefault: false },
          { id: 'hara-hachi-bu', name: 'Hara Hachi Bu', durationMinutes: 12, isDefault: false },
          { id: 'ikigai-reflection', name: 'Ikigai Reflection', durationMinutes: 25, isDefault: false },
          { id: 'zazen-sitting', name: 'Zazen Sitting', durationMinutes: 30, isDefault: false },
          { id: 'longevity-walk', name: 'Longevity Walk', durationMinutes: 45, isDefault: false },
          { id: 'box-breathing', name: 'Box Breathing', durationMinutes: 5.3, isDefault: false },
          { id: '4-7-8-breathing', name: '4-7-8 Relaxation', durationMinutes: 11.5, isDefault: false },
          { id: 'deep-breathing', name: 'Deep Breathing', durationMinutes: 14, isDefault: false }
        ];

        // Load custom profiles from localStorage
        const savedProfiles = localStorage.getItem('timerProfiles');
        let allProfiles = DEFAULT_PROFILES;
        if (savedProfiles) {
          allProfiles = JSON.parse(savedProfiles);
        }

        const savedProfile = allProfiles.find(p => p.id === lastProfileId);
        if (savedProfile) {
          console.log('Restoring profile on page load:', savedProfile.name, 'Duration:', savedProfile.durationMinutes);
          initializeTimerWithMinutes(savedProfile.durationMinutes);
          return;
        }
      }

      // Default to 25 minutes if no saved profile
      console.log('Using default 25 minutes');
      initializeTimerWithMinutes(25);
    };

    initializeTimerFromProfile();
  }, []); // Only run on mount

  // Check if current profile is a breathing profile and set up breathing mode
  useEffect(() => {
    if (activeTimerProfile && activeTimerProfile.exerciseSeries?.backgroundAnimation?.includes('breathing') ||
        ['box-breathing', '4-7-8-breathing', 'deep-breathing'].includes(activeTimerProfile.id)) {
      // Get breathing pattern based on profile
      let pattern = null;
      switch (activeTimerProfile.id) {
        case 'box-breathing':
          pattern = BREATHING_PATTERNS.BOX_BREATHING;
          break;
        case '4-7-8-breathing':
          pattern = BREATHING_PATTERNS.FOUR_SEVEN_EIGHT_BREATHING;
          break;
        case 'deep-breathing':
          pattern = BREATHING_PATTERNS.DEEP_BREATHING;
          break;
        default:
          if (activeTimerProfile.exerciseSeries?.breathingPattern) {
            pattern = activeTimerProfile.exerciseSeries.breathingPattern;
          }
      }
      setBreathingPattern(pattern);
    } else {
      setBreathingPattern(null);
    }
  }, [activeTimerProfile]);

  // Auto-start breathing mode when timer starts for breathing profiles
  useEffect(() => {
    if (currentTimerData.state === TimerState.RUNNING && breathingPattern) {
      setShowBreathingMode(true);
    } else if (currentTimerData.state === TimerState.IDLE || currentTimerData.state === TimerState.STOPPED) {
      setShowBreathingMode(false);
    }
  }, [currentTimerData.state, breathingPattern]);

  const sessionProgress = getSessionProgressPercentage();
  const formattedTimeDisplay = getFormattedTimeDisplay();

  // Calculate stroke dash for circular progress indicator
  const circleRadius = 120;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const progressStrokeDashoffset = circleCircumference - (sessionProgress / 100) * circleCircumference;

  // Determine timer state color for visual feedback
  const getTimerStateColor = () => {
    switch (currentTimerData.state) {
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

  // Handle custom duration submission
  const applyCustomDuration = () => {
    const totalSeconds = (customMinutes * 60) + customSeconds;
    if (totalSeconds > 0) {
      initializeTimerWithSeconds(totalSeconds);
      setShowCustomDurationPanel(false);
    }
  };

  // Render control buttons based on timer state
  const renderTimerControls = () => {
    switch (currentTimerData.state) {
      case TimerState.IDLE:
        return (
          <button
            onClick={startFocusSession}
            className="px-8 py-4 bg-blue-500 text-white rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors touch-target"
            data-testid="start-focus-button"
          >
            Start Focus Session
          </button>
        );

      case TimerState.RUNNING:
        return (
          <button
            onClick={pauseFocusSession}
            className="px-8 py-4 bg-yellow-500 text-white rounded-full text-lg font-semibold hover:bg-yellow-600 transition-colors touch-target"
            data-testid="pause-button"
          >
            Pause Session
          </button>
        );

      case TimerState.PAUSED:
        return (
          <div className="flex gap-4">
            <button
              onClick={resumeFocusSession}
              className="px-8 py-4 bg-green-500 text-white rounded-full text-lg font-semibold hover:bg-green-600 transition-colors touch-target"
              data-testid="resume-button"
            >
              Resume
            </button>
            <button
              onClick={stopFocusSession}
              className="px-6 py-4 bg-red-500 text-white rounded-full text-lg font-semibold hover:bg-red-600 transition-colors touch-target"
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
            onClick={resetFocusTimer}
            className="px-8 py-4 bg-gray-500 text-white rounded-full text-lg font-semibold hover:bg-gray-600 transition-colors touch-target"
            data-testid="reset-timer-button"
          >
            Reset Timer
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full">

        {/* App Title and Profile Name */}
        <div className="text-center mb-8">
          <h1 className="text-lg font-light text-gray-500 mb-2 tracking-wide">
            LiveLong ⊹
          </h1>
          <h2 className="text-2xl font-bold text-gray-800">
            {activeTimerProfile?.name || 'Focus Timer'}
          </h2>
          {activeTimerProfile?.description && (
            <p className="text-gray-600 mt-2">{activeTimerProfile.description}</p>
          )}
        </div>

        {/* Circular Timer Display */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto mb-8">
          <svg className="transform -rotate-90 w-64 h-64 sm:w-72 sm:h-72">
            {/* Background circle */}
            <circle
              cx="144"
              cy="144"
              r={circleRadius}
              stroke="#E5E7EB"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="144"
              cy="144"
              r={circleRadius}
              stroke={getTimerStateColor()}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circleCircumference}
              strokeDashoffset={progressStrokeDashoffset}
              className="transition-all duration-300 ease-linear"
              data-testid="progress-circle"
            />
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="text-5xl sm:text-6xl font-bold text-gray-800 tabular-nums no-select"
              data-testid="time-display"
            >
              {formattedTimeDisplay}
            </div>
            <div className="text-lg text-gray-600 mt-2">
              {sessionProgress}% complete
            </div>
            {currentTimerData.state === TimerState.COMPLETED && (
              <div className="text-green-500 font-semibold mt-2">
                Session Complete! 🎉
              </div>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center mb-6" data-testid="timer-controls">
          {renderTimerControls()}
        </div>

        {/* Quick Duration Presets - Including Exercise Intervals */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 text-center mb-3">Quick Presets:</p>
          <div className="grid grid-cols-3 gap-2">
            {/* Exercise Intervals */}
            <button
              onClick={() => initializeTimerWithSeconds(30)}
              className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
              data-testid="duration-30s"
            >
              30 sec
            </button>
            <button
              onClick={() => initializeTimerWithSeconds(45)}
              className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
              data-testid="duration-45s"
            >
              45 sec
            </button>
            <button
              onClick={() => initializeTimerWithSeconds(60)}
              className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
              data-testid="duration-1min"
            >
              1 min
            </button>

            {/* Work Sessions */}
            <button
              onClick={() => initializeTimerWithMinutes(5)}
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              data-testid="duration-5min"
            >
              5 min
            </button>
            <button
              onClick={() => initializeTimerWithMinutes(15)}
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              data-testid="duration-15min"
            >
              15 min
            </button>
            <button
              onClick={() => initializeTimerWithMinutes(25)}
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              data-testid="duration-25min"
            >
              25 min
            </button>
          </div>
        </div>

        {/* Custom Duration Button */}
        <button
          onClick={() => setShowCustomDurationPanel(!showCustomDurationPanel)}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          data-testid="custom-duration-button"
        >
          Set Custom Duration
        </button>

        {/* Custom Duration Input Panel */}
        {showCustomDurationPanel && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex gap-4 items-end mb-3">
              <div className="flex-1">
                <label className="text-xs text-gray-600 mb-1 block">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border rounded-lg text-center text-lg"
                  data-testid="custom-minutes-input"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600 mb-1 block">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customSeconds}
                  onChange={(e) => setCustomSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 border rounded-lg text-center text-lg"
                  data-testid="custom-seconds-input"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={applyCustomDuration}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                data-testid="apply-custom-duration"
              >
                Apply Duration
              </button>
              <button
                onClick={() => setShowCustomDurationPanel(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                data-testid="cancel-custom-duration"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Timer State Indicator */}
        <div className="text-center mt-6">
          <span className="text-sm text-gray-500">
            Timer Status: {' '}
            <span className="font-semibold capitalize">
              {currentTimerData.state.toLowerCase().replace('_', ' ')}
            </span>
          </span>
        </div>

        {/* Breathing Mode Button (for breathing profiles) */}
        {breathingPattern && currentTimerData.state === TimerState.IDLE && (
          <div className="mt-4">
            <button
              onClick={() => setShowBreathingMode(true)}
              className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
              data-testid="start-breathing-button"
            >
              Start Breathing Guide
            </button>
          </div>
        )}

        {/* Profile Manager Button */}
        <div className="mt-4">
          <button
            onClick={() => setShowProfileManager(!showProfileManager)}
            className="w-full px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
            data-testid="toggle-profiles-button"
          >
            {showProfileManager ? 'Hide Profiles' : 'Manage Profiles'}
          </button>
        </div>
      </div>

      {/* Profile Manager Section */}
      {showProfileManager && (
        <div className="mt-6">
          <ProfileManager />
        </div>
      )}

      {/* PWA Status Indicator */}
      <PWAStatusIndicator />

      {/* Breathing Visualizer */}
      {breathingPattern && showBreathingMode && (
        <BreathingVisualizer
          pattern={breathingPattern}
          isActive={showBreathingMode}
          onComplete={() => setShowBreathingMode(false)}
          onCycleComplete={(cycle) => console.log(`Breathing cycle ${cycle} completed`)}
        />
      )}
    </div>
  );
}