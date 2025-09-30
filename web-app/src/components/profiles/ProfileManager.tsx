// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/components/profiles/ProfileManager.tsx
// Description: Profile management UI for creating, editing, and selecting timer profiles
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

'use client';

import React, { useState, useEffect } from 'react';
import { Profile } from '@/types/profile.types';
import { useFocusTimerStore } from '@/store/focusTimerStore';
import { JAPANESE_EXERCISE_SERIES, getAllJapaneseExerciseSeries } from '@/data/japanese-exercise-series';
import { getAllBreathingProfiles } from '@/data/breathing-profiles';

interface ProfileFormData {
  name: string;
  description: string;
  durationMinutes: number;
  durationSeconds: number;
  breakMinutes: number;
  breakSeconds: number;
  color: string;
  icon: string;
}

const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    description: 'Classic 25-minute focus sessions',
    durationMinutes: 25,
    breakMinutes: 5,
    isDefault: true,
    color: '#ef4444',
    icon: '🍅'
  },
  {
    id: 'deep-work',
    name: 'Deep Work',
    description: '90-minute deep focus blocks',
    durationMinutes: 90,
    breakMinutes: 15,
    isDefault: false,
    color: '#3b82f6',
    icon: '🧠'
  },
  {
    id: 'exercise',
    name: 'Exercise Intervals',
    description: '30-second high intensity intervals',
    durationMinutes: 0.5,
    breakMinutes: 0.5,
    isDefault: false,
    color: '#10b981',
    icon: '💪'
  },
  {
    id: 'meditation',
    name: 'Meditation',
    description: '10-minute mindfulness sessions',
    durationMinutes: 10,
    breakMinutes: 2,
    isDefault: false,
    color: '#8b5cf6',
    icon: '🧘'
  },
  {
    id: 'rajio-taiso',
    name: 'Rajio Taiso',
    description: 'Japanese radio calisthenics - series of energizing exercises',
    durationMinutes: JAPANESE_EXERCISE_SERIES.RAJIO_TAISO.totalDurationMinutes,
    breakMinutes: 1,
    isDefault: false,
    color: '#dc2626',
    icon: '📻',
    exerciseSeries: JAPANESE_EXERCISE_SERIES.RAJIO_TAISO
  },
  {
    id: 'tai-chi-morning',
    name: 'Tai Chi Morning',
    description: 'Gentle flowing movements series for longevity',
    durationMinutes: JAPANESE_EXERCISE_SERIES.TAI_CHI_MORNING.totalDurationMinutes,
    breakMinutes: 2,
    isDefault: false,
    color: '#059669',
    icon: '🌅',
    exerciseSeries: JAPANESE_EXERCISE_SERIES.TAI_CHI_MORNING
  },
  {
    id: 'shinrin-yoku',
    name: 'Shinrin-yoku',
    description: 'Forest bathing meditation series - mindful nature connection',
    durationMinutes: JAPANESE_EXERCISE_SERIES.SHINRIN_YOKU.totalDurationMinutes,
    breakMinutes: 5,
    isDefault: false,
    color: '#065f46',
    icon: '🌲',
    exerciseSeries: JAPANESE_EXERCISE_SERIES.SHINRIN_YOKU
  },
  {
    id: 'hara-hachi-bu',
    name: 'Hara Hachi Bu',
    description: '12-minute mindful eating practice',
    durationMinutes: 12,
    breakMinutes: 3,
    isDefault: false,
    color: '#7c2d12',
    icon: '🍵'
  },
  {
    id: 'ikigai-reflection',
    name: 'Ikigai Reflection',
    description: '25-minute purpose and meaning contemplation',
    durationMinutes: 25,
    breakMinutes: 5,
    isDefault: false,
    color: '#7c3aed',
    icon: '🎋'
  },
  {
    id: 'zazen-sitting',
    name: 'Zazen Sitting',
    description: '30-minute seated Zen meditation',
    durationMinutes: 30,
    breakMinutes: 5,
    isDefault: false,
    color: '#1f2937',
    icon: '⛩️'
  },
  {
    id: 'longevity-walk',
    name: 'Longevity Walk',
    description: '45-minute mindful walking practice',
    durationMinutes: 45,
    breakMinutes: 10,
    isDefault: false,
    color: '#92400e',
    icon: '🚶'
  },

  // Breathing Exercises
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    description: 'Navy SEAL technique for focus and stress reduction',
    durationMinutes: 5.3, // ~5 minutes 20 seconds
    breakMinutes: 2,
    isDefault: false,
    color: '#3b82f6',
    icon: '⬜',
    exerciseSeries: {
      id: 'box-breathing-series',
      name: 'Box Breathing Session',
      description: 'Structured breathing for mental clarity',
      steps: [{
        id: 'box-breathing-main',
        name: 'Box Breathing',
        description: 'Equal count breathing pattern',
        durationMinutes: 5.3,
        restDurationMinutes: 0,
        instructions: 'Breathe in for 4, hold for 4, breathe out for 4, hold for 4'
      }],
      totalDurationMinutes: 5.3,
      backgroundAnimation: 'breathing-squares'
    }
  },
  {
    id: '4-7-8-breathing',
    name: '4-7-8 Relaxation',
    description: 'Dr. Andrew Weil\'s natural tranquilizer technique',
    durationMinutes: 11.5, // ~11 minutes 30 seconds
    breakMinutes: 3,
    isDefault: false,
    color: '#10b981',
    icon: '🌊',
    exerciseSeries: {
      id: '4-7-8-breathing-series',
      name: '4-7-8 Breathing Session',
      description: 'Calming breath work for relaxation',
      steps: [{
        id: '4-7-8-breathing-main',
        name: '4-7-8 Breathing',
        description: 'Relaxing breathing pattern',
        durationMinutes: 11.5,
        restDurationMinutes: 0,
        instructions: 'Breathe in for 4, hold for 7, breathe out for 8'
      }],
      totalDurationMinutes: 11.5,
      backgroundAnimation: 'gentle-waves'
    }
  },
  {
    id: 'deep-breathing',
    name: 'Deep Breathing',
    description: 'Simple deep breathing for stress relief',
    durationMinutes: 14, // 14 minutes
    breakMinutes: 2,
    isDefault: false,
    color: '#8b5cf6',
    icon: '💨',
    exerciseSeries: {
      id: 'deep-breathing-series',
      name: 'Deep Breathing Session',
      description: 'Calming deep breath work',
      steps: [{
        id: 'deep-breathing-main',
        name: 'Deep Breathing',
        description: 'Simple deep breathing pattern',
        durationMinutes: 14,
        restDurationMinutes: 0,
        instructions: 'Breathe deeply and slowly, focusing on the rhythm'
      }],
      totalDurationMinutes: 14,
      backgroundAnimation: 'flowing-clouds'
    }
  }
];

const PROFILE_ICONS = ['🍅', '🧠', '💪', '🧘', '📚', '💻', '☕', '🎯', '⚡', '🔥', '📻', '🌅', '🌲', '🍵', '🎋', '⛩️', '🚶', '🏯', '🌸', '🍃', '⬜', '🌊', '💨', '🫁', '🌀', '☯️', '🪷'];
const PROFILE_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#84cc16',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'
];

export default function ProfileManager() {
  const [profiles, setProfiles] = useState<Profile[]>(DEFAULT_PROFILES);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    description: '',
    durationMinutes: 25,
    durationSeconds: 0,
    breakMinutes: 5,
    breakSeconds: 0,
    color: '#3b82f6',
    icon: '🍅'
  });

  const { setActiveTimerProfile, initializeTimerWithSeconds } = useFocusTimerStore();

  useEffect(() => {
    // Load profiles from localStorage
    const savedProfiles = localStorage.getItem('timerProfiles');
    let loadedProfiles = DEFAULT_PROFILES;
    if (savedProfiles) {
      loadedProfiles = JSON.parse(savedProfiles);
      setProfiles(loadedProfiles);
    }

    // Set selected profile based on what's currently saved (for UI display only)
    const lastProfileId = localStorage.getItem('lastSelectedProfile');
    if (lastProfileId) {
      const profile = loadedProfiles.find(p => p.id === lastProfileId);
      if (profile) {
        setSelectedProfile(profile);
        setActiveTimerProfile(profile); // Update store for UI consistency
      }
    }
  }, []);

  const handleSelectProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setActiveTimerProfile(profile);

    // Calculate total seconds including any seconds component
    const totalSeconds = profile.durationMinutes * 60;
    initializeTimerWithSeconds(totalSeconds);

    // Save selection
    localStorage.setItem('lastSelectedProfile', profile.id);
  };

  const handleCreateProfile = () => {
    const newProfile: Profile = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      durationMinutes: formData.durationMinutes + (formData.durationSeconds / 60),
      breakMinutes: formData.breakMinutes + (formData.breakSeconds / 60),
      isDefault: false,
      color: formData.color,
      icon: formData.icon
    };

    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    localStorage.setItem('timerProfiles', JSON.stringify(updatedProfiles));

    // Select the new profile
    handleSelectProfile(newProfile);

    // Reset form
    setIsCreating(false);
    resetForm();
  };

  const handleEditProfile = (profile: Profile) => {
    setIsEditing(true);
    const totalMinutes = Math.floor(profile.durationMinutes);
    const totalSeconds = Math.round((profile.durationMinutes % 1) * 60);
    const breakTotalMinutes = Math.floor(profile.breakMinutes);
    const breakTotalSeconds = Math.round((profile.breakMinutes % 1) * 60);

    setFormData({
      name: profile.name,
      description: profile.description || '',
      durationMinutes: totalMinutes,
      durationSeconds: totalSeconds,
      breakMinutes: breakTotalMinutes,
      breakSeconds: breakTotalSeconds,
      color: profile.color || '#3b82f6',
      icon: profile.icon || '🍅'
    });
  };

  const handleUpdateProfile = () => {
    if (!selectedProfile) return;

    const updatedProfile: Profile = {
      ...selectedProfile,
      name: formData.name,
      description: formData.description,
      durationMinutes: formData.durationMinutes + (formData.durationSeconds / 60),
      breakMinutes: formData.breakMinutes + (formData.breakSeconds / 60),
      color: formData.color,
      icon: formData.icon
    };

    const updatedProfiles = profiles.map(p =>
      p.id === selectedProfile.id ? updatedProfile : p
    );

    setProfiles(updatedProfiles);
    localStorage.setItem('timerProfiles', JSON.stringify(updatedProfiles));

    setIsEditing(false);
    resetForm();
    handleSelectProfile(updatedProfile);
  };

  const handleDeleteProfile = (profileId: string) => {
    // Don't delete default profiles
    const profile = profiles.find(p => p.id === profileId);
    if (profile?.isDefault) return;

    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    setProfiles(updatedProfiles);
    localStorage.setItem('timerProfiles', JSON.stringify(updatedProfiles));

    // Select default profile if deleted was selected
    if (selectedProfile?.id === profileId) {
      const defaultProfile = profiles.find(p => p.isDefault);
      if (defaultProfile) {
        handleSelectProfile(defaultProfile);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      durationMinutes: 25,
      durationSeconds: 0,
      breakMinutes: 5,
      breakSeconds: 0,
      color: '#3b82f6',
      icon: '🍅'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Timer Profiles</h2>

      {/* Profile Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {profiles.map(profile => (
          <div
            key={profile.id}
            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all
              ${selectedProfile?.id === profile.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'}`}
            onClick={() => handleSelectProfile(profile)}
            data-testid={`profile-${profile.id}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                <span className="text-2xl mr-2">{profile.icon}</span>
                <h3 className="font-semibold text-gray-800">{profile.name}</h3>
              </div>
              {!profile.isDefault && (
                <button
                  className="text-red-500 hover:text-red-700 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProfile(profile.id);
                  }}
                  data-testid={`delete-profile-${profile.id}`}
                >
                  Delete
                </button>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-2">{profile.description}</p>

            {/* Exercise Series Information */}
            {profile.exerciseSeries && (
              <div className="mb-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-xs font-medium text-orange-700 mb-1">
                  Exercise Series ({profile.exerciseSeries.steps.length} steps)
                </div>
                <div className="text-xs text-orange-600">
                  {profile.exerciseSeries.steps.map((step, index) => (
                    <span key={step.id}>
                      {index > 0 && ' → '}
                      {step.name} ({step.durationMinutes}min)
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                {profile.durationMinutes >= 1
                  ? `${Math.floor(profile.durationMinutes)} min`
                  : `${Math.round(profile.durationMinutes * 60)} sec`}
              </span>
              <span className="text-gray-500">
                Break: {profile.breakMinutes >= 1
                  ? `${Math.floor(profile.breakMinutes)} min`
                  : `${Math.round(profile.breakMinutes * 60)} sec`}
              </span>
            </div>

            {selectedProfile?.id === profile.id && (
              <button
                className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditProfile(profile);
                }}
                data-testid="edit-profile-button"
              >
                Edit Profile
              </button>
            )}
          </div>
        ))}

        {/* Add New Profile Card */}
        <div
          className="p-4 rounded-xl border-2 border-dashed border-gray-300
            hover:border-gray-400 cursor-pointer flex items-center justify-center
            min-h-[150px] transition-colors"
          onClick={() => setIsCreating(true)}
          data-testid="add-profile-button"
        >
          <div className="text-center">
            <div className="text-3xl mb-2">➕</div>
            <p className="text-gray-600">Create Profile</p>
          </div>
        </div>
      </div>

      {/* Profile Form Modal */}
      {(isCreating || isEditing) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {isCreating ? 'Create New Profile' : 'Edit Profile'}
            </h3>

            <div className="space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Morning Focus"
                  data-testid="profile-name-input"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Early morning deep work sessions"
                  data-testid="profile-description-input"
                />
              </div>

              {/* Duration Inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timer Duration
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({
                        ...formData,
                        durationMinutes: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                      data-testid="profile-minutes-input"
                    />
                    <label className="text-xs text-gray-500 mt-1 block text-center font-medium">
                      Minutes
                    </label>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={formData.durationSeconds}
                      onChange={(e) => setFormData({
                        ...formData,
                        durationSeconds: Math.min(59, parseInt(e.target.value) || 0)
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                      max="59"
                      data-testid="profile-seconds-input"
                    />
                    <label className="text-xs text-gray-500 mt-1 block text-center font-medium">
                      Seconds (0-59)
                    </label>
                  </div>
                </div>
              </div>

              {/* Break Duration Inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Break Duration
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      value={formData.breakMinutes}
                      onChange={(e) => setFormData({
                        ...formData,
                        breakMinutes: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                      data-testid="break-minutes-input"
                    />
                    <label className="text-xs text-gray-500 mt-1 block text-center font-medium">
                      Minutes
                    </label>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={formData.breakSeconds}
                      onChange={(e) => setFormData({
                        ...formData,
                        breakSeconds: Math.min(59, parseInt(e.target.value) || 0)
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                      max="59"
                      data-testid="break-seconds-input"
                    />
                    <label className="text-xs text-gray-500 mt-1 block text-center font-medium">
                      Seconds (0-59)
                    </label>
                  </div>
                </div>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROFILE_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`text-2xl p-2 rounded-lg border-2 transition-colors
                        ${formData.icon === icon
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'}`}
                      data-testid={`icon-${icon}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROFILE_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-lg border-2 transition-all
                        ${formData.color === color
                          ? 'border-gray-800 scale-110'
                          : 'border-gray-300 hover:border-gray-400'}`}
                      style={{ backgroundColor: color }}
                      data-testid={`color-${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                data-testid="cancel-profile-button"
              >
                Cancel
              </button>
              <button
                onClick={isCreating ? handleCreateProfile : handleUpdateProfile}
                disabled={!formData.name}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg
                  hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                data-testid="save-profile-button"
              >
                {isCreating ? 'Create Profile' : 'Update Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}