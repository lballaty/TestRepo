// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/focus_productivity_timer/lib/shared/providers/app_state_provider.dart
// Description: Global application state management with Riverpod
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-26

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/material.dart';

/// Global application state
class AppState {
  final bool isInitialized;
  final bool isOnline;
  final bool isFirstLaunch;
  final ThemeMode themeMode;
  final bool notificationsEnabled;
  final bool aiCoachingEnabled;
  final bool analyticsConsent;
  final String selectedLanguage;
  final Map<String, dynamic> appSettings;

  const AppState({
    this.isInitialized = false,
    this.isOnline = false,
    this.isFirstLaunch = true,
    this.themeMode = ThemeMode.system,
    this.notificationsEnabled = true,
    this.aiCoachingEnabled = true,
    this.analyticsConsent = false,
    this.selectedLanguage = 'en',
    this.appSettings = const {},
  });

  AppState copyWith({
    bool? isInitialized,
    bool? isOnline,
    bool? isFirstLaunch,
    ThemeMode? themeMode,
    bool? notificationsEnabled,
    bool? aiCoachingEnabled,
    bool? analyticsConsent,
    String? selectedLanguage,
    Map<String, dynamic>? appSettings,
  }) {
    return AppState(
      isInitialized: isInitialized ?? this.isInitialized,
      isOnline: isOnline ?? this.isOnline,
      isFirstLaunch: isFirstLaunch ?? this.isFirstLaunch,
      themeMode: themeMode ?? this.themeMode,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      aiCoachingEnabled: aiCoachingEnabled ?? this.aiCoachingEnabled,
      analyticsConsent: analyticsConsent ?? this.analyticsConsent,
      selectedLanguage: selectedLanguage ?? this.selectedLanguage,
      appSettings: appSettings ?? this.appSettings,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AppState &&
          runtimeType == other.runtimeType &&
          isInitialized == other.isInitialized &&
          isOnline == other.isOnline &&
          isFirstLaunch == other.isFirstLaunch &&
          themeMode == other.themeMode &&
          notificationsEnabled == other.notificationsEnabled &&
          aiCoachingEnabled == other.aiCoachingEnabled &&
          analyticsConsent == other.analyticsConsent &&
          selectedLanguage == other.selectedLanguage;

  @override
  int get hashCode =>
      isInitialized.hashCode ^
      isOnline.hashCode ^
      isFirstLaunch.hashCode ^
      themeMode.hashCode ^
      notificationsEnabled.hashCode ^
      aiCoachingEnabled.hashCode ^
      analyticsConsent.hashCode ^
      selectedLanguage.hashCode;
}

/// Application state notifier
class AppStateNotifier extends StateNotifier<AppState> {
  AppStateNotifier() : super(const AppState());

  /// Initialize the application
  Future<void> initializeApp() async {
    // Simulate initialization process
    await Future.delayed(const Duration(milliseconds: 500));

    state = state.copyWith(
      isInitialized: true,
      isOnline: true, // TODO: Implement actual connectivity check
    );
  }

  /// Update online status
  void updateOnlineStatus(bool isOnline) {
    state = state.copyWith(isOnline: isOnline);
  }

  /// Complete first launch setup
  void completeFirstLaunch() {
    state = state.copyWith(isFirstLaunch: false);
  }

  /// Update theme mode
  void updateThemeMode(ThemeMode themeMode) {
    state = state.copyWith(themeMode: themeMode);
  }

  /// Toggle notifications
  void toggleNotifications(bool enabled) {
    state = state.copyWith(notificationsEnabled: enabled);
  }

  /// Toggle AI coaching
  void toggleAiCoaching(bool enabled) {
    state = state.copyWith(aiCoachingEnabled: enabled);
  }

  /// Update analytics consent
  void updateAnalyticsConsent(bool consent) {
    state = state.copyWith(analyticsConsent: consent);
  }

  /// Update selected language
  void updateLanguage(String languageCode) {
    state = state.copyWith(selectedLanguage: languageCode);
  }

  /// Update app settings
  void updateAppSettings(Map<String, dynamic> settings) {
    state = state.copyWith(appSettings: settings);
  }

  /// Reset app state (for testing or logout)
  void resetAppState() {
    state = const AppState();
  }
}

/// Global app state provider
final appStateProvider = StateNotifierProvider<AppStateNotifier, AppState>((ref) {
  return AppStateNotifier();
});

/// Convenience providers for specific app state properties
final isAppInitializedProvider = Provider<bool>((ref) {
  return ref.watch(appStateProvider).isInitialized;
});

final isOnlineProvider = Provider<bool>((ref) {
  return ref.watch(appStateProvider).isOnline;
});

final isFirstLaunchProvider = Provider<bool>((ref) {
  return ref.watch(appStateProvider).isFirstLaunch;
});

final themeModeProvider = Provider<ThemeMode>((ref) {
  return ref.watch(appStateProvider).themeMode;
});

final notificationsEnabledProvider = Provider<bool>((ref) {
  return ref.watch(appStateProvider).notificationsEnabled;
});

final aiCoachingEnabledProvider = Provider<bool>((ref) {
  return ref.watch(appStateProvider).aiCoachingEnabled;
});

final analyticsConsentProvider = Provider<bool>((ref) {
  return ref.watch(appStateProvider).analyticsConsent;
});

final selectedLanguageProvider = Provider<String>((ref) {
  return ref.watch(appStateProvider).selectedLanguage;
});

/// Provider for app initialization future
final appInitializationProvider = FutureProvider<void>((ref) async {
  final appStateNotifier = ref.read(appStateProvider.notifier);
  await appStateNotifier.initializeApp();
});

/// Provider to check if app is ready for use
final appReadyProvider = Provider<bool>((ref) {
  final appState = ref.watch(appStateProvider);
  final databaseInit = ref.watch(databaseInitializationProvider);

  return appState.isInitialized &&
         databaseInit.maybeWhen(
           data: (isReady) => isReady,
           orElse: () => false,
         );
});

/// Import the database provider
import 'database_provider.dart';