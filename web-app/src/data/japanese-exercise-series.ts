// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/data/japanese-exercise-series.ts
// Description: Japanese longevity exercise series data with detailed steps and timings
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { ExerciseSeries, ExerciseStep } from '@/types/profile.types';
import { BREATHING_PATTERNS } from './breathing-patterns';

/**
 * Calculate total duration for an exercise series
 */
function calculateTotalDuration(steps: ExerciseStep[], warmup = 0, cooldown = 0): number {
  const stepsDuration = steps.reduce((total, step) =>
    total + step.durationMinutes + step.restDurationMinutes, 0
  );
  return warmup + stepsDuration + cooldown;
}

/**
 * Rajio Taiso (Radio Calisthenics) Exercise Series
 * Traditional Japanese morning exercise routine
 */
export const RAJIO_TAISO_SERIES: ExerciseSeries = {
  id: 'rajio-taiso-series',
  name: 'Rajio Taiso Complete Series',
  description: 'Traditional Japanese radio calisthenics - energizing morning routine',
  warmupDurationMinutes: 0.5, // 30 seconds
  cooldownDurationMinutes: 0.5, // 30 seconds
  steps: [
    {
      id: 'neck-arm-stretch',
      name: 'Neck and Arm Stretches',
      description: 'Gentle neck rotations and arm stretches',
      durationMinutes: 1,
      restDurationMinutes: 0.25, // 15 seconds
      instructions: 'Slowly rotate neck, stretch arms up and out'
    },
    {
      id: 'arm-swings',
      name: 'Arm Swings',
      description: 'Rhythmic arm swinging movements',
      durationMinutes: 1,
      restDurationMinutes: 0.25,
      instructions: 'Swing arms forward and backward in rhythm'
    },
    {
      id: 'chest-expansion',
      name: 'Chest Expansion',
      description: 'Open chest and expand lungs',
      durationMinutes: 1,
      restDurationMinutes: 0.25,
      instructions: 'Bring arms back to open chest, breathe deeply'
    },
    {
      id: 'side-bends',
      name: 'Side Bends',
      description: 'Lateral trunk flexibility',
      durationMinutes: 1,
      restDurationMinutes: 0.25,
      instructions: 'Bend to each side, reach arm overhead'
    },
    {
      id: 'trunk-twists',
      name: 'Trunk Twists',
      description: 'Spinal rotation movements',
      durationMinutes: 1,
      restDurationMinutes: 0.25,
      instructions: 'Rotate torso left and right with arms extended'
    },
    {
      id: 'leg-swings',
      name: 'Leg Swings',
      description: 'Dynamic leg movements',
      durationMinutes: 1,
      restDurationMinutes: 0,
      instructions: 'Swing legs forward and back, side to side'
    }
  ],
  get totalDurationMinutes() {
    return calculateTotalDuration(this.steps, this.warmupDurationMinutes, this.cooldownDurationMinutes);
  }
};

/**
 * Tai Chi Morning Flow Exercise Series
 * Gentle flowing movements for balance and energy
 */
export const TAI_CHI_MORNING_SERIES: ExerciseSeries = {
  id: 'tai-chi-morning-series',
  name: 'Tai Chi Morning Flow',
  description: 'Gentle flowing movements for balance, flexibility, and inner calm',
  warmupDurationMinutes: 1,
  cooldownDurationMinutes: 1,
  steps: [
    {
      id: 'beginning-stance',
      name: 'Beginning Stance',
      description: 'Center and ground yourself',
      durationMinutes: 2,
      restDurationMinutes: 0.5,
      instructions: 'Stand feet shoulder-width apart, breathe deeply'
    },
    {
      id: 'raise-arms',
      name: 'Raise Arms',
      description: 'Slow arm raising movement',
      durationMinutes: 2,
      restDurationMinutes: 0.5,
      instructions: 'Slowly raise arms to shoulder height'
    },
    {
      id: 'wave-hands',
      name: 'Wave Hands Like Clouds',
      description: 'Flowing horizontal arm movements',
      durationMinutes: 3,
      restDurationMinutes: 0.5,
      instructions: 'Move arms in smooth horizontal waves'
    },
    {
      id: 'single-whip',
      name: 'Single Whip',
      description: 'Classic tai chi movement',
      durationMinutes: 3,
      restDurationMinutes: 0.5,
      instructions: 'Extend one arm, turn body slowly'
    },
    {
      id: 'embrace-tiger',
      name: 'Embrace Tiger, Return to Mountain',
      description: 'Circular gathering movement',
      durationMinutes: 3,
      restDurationMinutes: 0,
      instructions: 'Large circular arm movements, gather energy'
    }
  ],
  get totalDurationMinutes() {
    return calculateTotalDuration(this.steps, this.warmupDurationMinutes, this.cooldownDurationMinutes);
  }
};

/**
 * Shinrin-yoku (Forest Bathing) Meditation Series
 * Mindful nature connection practice
 */
export const SHINRIN_YOKU_SERIES: ExerciseSeries = {
  id: 'shinrin-yoku-series',
  name: 'Shinrin-yoku Practice',
  description: 'Forest bathing meditation - mindful connection with nature',
  warmupDurationMinutes: 2,
  cooldownDurationMinutes: 2,
  breathingPattern: BREATHING_PATTERNS.DEEP_BREATHING,
  backgroundAnimation: 'forest-leaves',
  steps: [
    {
      id: 'sensory-awakening',
      name: 'Sensory Awakening',
      description: 'Open all five senses',
      durationMinutes: 4,
      restDurationMinutes: 1,
      instructions: 'Notice what you see, hear, smell, feel, taste'
    },
    {
      id: 'mindful-breathing',
      name: 'Mindful Breathing',
      description: 'Breathe with the forest rhythm',
      durationMinutes: 5,
      restDurationMinutes: 1,
      instructions: 'Breathe deeply, imagine breathing with trees'
    },
    {
      id: 'tree-connection',
      name: 'Tree Connection',
      description: 'Connect with a specific tree or plant',
      durationMinutes: 6,
      restDurationMinutes: 1,
      instructions: 'Focus on one tree, feel its presence and energy'
    },
    {
      id: 'gratitude-reflection',
      name: 'Gratitude Reflection',
      description: 'Express gratitude to nature',
      durationMinutes: 4,
      restDurationMinutes: 0,
      instructions: 'Silently thank nature for its gifts and wisdom'
    }
  ],
  get totalDurationMinutes() {
    return calculateTotalDuration(this.steps, this.warmupDurationMinutes, this.cooldownDurationMinutes);
  }
};

/**
 * Collection of all Japanese exercise series
 */
export const JAPANESE_EXERCISE_SERIES = {
  RAJIO_TAISO: RAJIO_TAISO_SERIES,
  TAI_CHI_MORNING: TAI_CHI_MORNING_SERIES,
  SHINRIN_YOKU: SHINRIN_YOKU_SERIES,
} as const;

/**
 * Get all exercise series as an array
 */
export function getAllJapaneseExerciseSeries(): ExerciseSeries[] {
  return Object.values(JAPANESE_EXERCISE_SERIES);
}

/**
 * Get exercise series by ID
 */
export function getExerciseSeriesById(id: string): ExerciseSeries | undefined {
  return Object.values(JAPANESE_EXERCISE_SERIES).find(series => series.id === id);
}