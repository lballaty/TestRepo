# File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/design_document.md
# Description: Technical design document for Focus & Productivity Timer App implementation
# Author: Libor Ballaty <libor@arionetworks.com>
# Created: 2025-09-26

# Focus & Productivity Timer App - Design Document

## 1. System Architecture Overview

### 1.1 High-Level Architecture

The application follows an offline-first, layered architecture designed for maximum reliability and performance:

```
┌─────────────────────────────────────────────────┐
│                 Presentation Layer              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   Timer UI  │ │ Profile UI  │ │Analytics UI │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│                Business Logic Layer             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │Timer Service│ │Profile Mgmt │ │  AI Engine  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│                  Data Access Layer              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │Local Storage│ │File Storage │ │ Cache Layer │ │
│  │  (SQLite)   │ │  (Media)    │ │ (Memory)    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│                Platform Integration Layer       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │Notifications│ │Background   │ │File System │ │
│  │   Service   │ │  Service    │ │   Access    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

**Core Framework**: Flutter 3.16+
- **Language**: Dart 3.0+
- **State Management**: Riverpod 2.0+
- **Local Database**: SQLite via sqflite package
- **File Storage**: path_provider for app directories
- **Background Processing**: WorkManager (Android) / Background App Refresh (iOS)
- **Local AI**: ONNX Runtime for Flutter or TensorFlow Lite
- **Audio**: audioplayers package for custom sounds
- **Notifications**: flutter_local_notifications

## 2. Data Architecture & Storage Design

### 2.1 Local SQLite Database Schema

```sql
-- Core Tables
CREATE TABLE profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    break_duration_minutes INTEGER DEFAULT 5,
    long_break_duration_minutes INTEGER DEFAULT 15,
    break_frequency INTEGER DEFAULT 4,
    notification_sound_path TEXT,
    theme_config TEXT, -- JSON
    blocking_config TEXT, -- JSON
    ai_coaching_enabled BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sequences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    total_duration_minutes INTEGER,
    auto_transition BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sequence_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sequence_id INTEGER NOT NULL,
    profile_id INTEGER NOT NULL,
    step_order INTEGER NOT NULL,
    FOREIGN KEY (sequence_id) REFERENCES sequences(id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER,
    sequence_id INTEGER,
    started_at DATETIME NOT NULL,
    completed_at DATETIME,
    planned_duration_minutes INTEGER NOT NULL,
    actual_duration_minutes INTEGER,
    completion_status TEXT CHECK (completion_status IN ('completed', 'stopped', 'interrupted')),
    pause_count INTEGER DEFAULT 0,
    total_pause_duration_minutes INTEGER DEFAULT 0,
    notes TEXT,
    ai_feedback TEXT,
    FOREIGN KEY (profile_id) REFERENCES profiles(id),
    FOREIGN KEY (sequence_id) REFERENCES sequences(id)
);

CREATE TABLE goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT CHECK (type IN ('daily', 'weekly', 'monthly')) NOT NULL,
    target_value INTEGER NOT NULL,
    target_unit TEXT CHECK (target_unit IN ('minutes', 'sessions', 'sequences')) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_preferences (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI and Analytics Tables
CREATE TABLE ai_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    interaction_type TEXT NOT NULL,
    input_context TEXT, -- JSON
    ai_response TEXT,
    user_feedback INTEGER CHECK (user_feedback BETWEEN 1 AND 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usage_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    event_data TEXT, -- JSON
    session_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Media and Customization Tables
CREATE TABLE custom_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('audio', 'image')) NOT NULL,
    file_size_bytes INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE themes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    is_built_in BOOLEAN DEFAULT 0,
    theme_data TEXT NOT NULL, -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 File System Structure

```
App Data Directory/
├── databases/
│   └── focus_app.db              # Main SQLite database
├── media/
│   ├── audio/
│   │   ├── notifications/        # Custom notification sounds
│   │   └── background/           # Background audio (future)
│   └── images/
│       ├── backgrounds/          # Custom backgrounds
│       └── themes/               # Theme assets
├── ai_models/
│   ├── local_coach_model.onnx    # Local AI model
│   └── model_cache/              # AI model cache
├── exports/
│   ├── profiles/                 # Exported profile files
│   ├── data/                     # Data export files
│   └── analytics/                # Analytics exports
├── cache/
│   ├── ui_cache/                 # UI component cache
│   └── ai_cache/                 # AI response cache
└── logs/
    ├── error_logs/               # Error tracking
    └── performance_logs/         # Performance metrics
```

## 3. Core Component Design

### 3.1 Timer Engine Architecture

```dart
// Timer Engine Core Classes
abstract class TimerEngine {
  Stream<TimerState> get stateStream;
  Future<void> startTimer(TimerConfiguration config);
  Future<void> pauseTimer();
  Future<void> resumeTimer();
  Future<void> stopTimer();
  Future<void> skipToNext(); // For sequences
}

class TimerState {
  final TimerStatus status;
  final Duration remaining;
  final Duration elapsed;
  final TimerConfiguration config;
  final int currentStep; // For sequences
  final int totalSteps;
  final DateTime? startedAt;
  final int pauseCount;
  final Duration totalPauseTime;
}

enum TimerStatus {
  idle,
  running,
  paused,
  completed,
  stopped,
  transitioning // Between sequence steps
}

class TimerConfiguration {
  final String profileId;
  final Duration duration;
  final bool isSequence;
  final List<SequenceStep>? sequenceSteps;
  final NotificationConfig notificationConfig;
  final AICoachingConfig aiConfig;
}
```

### 3.2 Profile Management System

```dart
class ProfileManager {
  // CRUD Operations
  Future<Profile> createProfile(ProfileData data);
  Future<Profile> updateProfile(String id, ProfileData data);
  Future<void> deleteProfile(String id);
  Future<Profile?> getProfile(String id);
  Future<List<Profile>> getAllProfiles();

  // Sequence Operations
  Future<Sequence> createSequence(SequenceData data);
  Future<List<Sequence>> getSequencesByProfile(String profileId);

  // Import/Export
  Future<String> exportProfile(String profileId);
  Future<Profile> importProfile(String profileData);
  Future<List<Profile>> getSharedProfiles(); // Online feature
}

class Profile {
  final String id;
  final String name;
  final String description;
  final Duration duration;
  final BreakConfiguration breakConfig;
  final NotificationConfiguration notificationConfig;
  final ThemeConfiguration themeConfig;
  final BlockingConfiguration? blockingConfig;
  final AICoachingConfiguration aiConfig;
  final DateTime createdAt;
  final DateTime updatedAt;
}

class Sequence {
  final String id;
  final String name;
  final String description;
  final List<SequenceStep> steps;
  final bool autoTransition;
  final Duration totalDuration;
}
```

### 3.3 Local AI Integration

```dart
class LocalAIEngine {
  // Core AI Operations
  Future<void> initializeModel();
  Future<String> generateMotivationalMessage(SessionContext context);
  Future<List<ProfileSuggestion>> suggestProfiles(UsagePattern pattern);
  Future<ProductivityInsight> analyzeProductivityTrends(AnalyticsData data);
  Future<String> generateCoachingTip(UserBehavior behavior);

  // Offline Learning
  void updateUserPreferences(UserFeedback feedback);
  void cacheCommonResponses();

  // Context Management
  SessionContext buildSessionContext(Session session, UserHistory history);
}

class SessionContext {
  final DateTime timeOfDay;
  final DayOfWeek dayOfWeek;
  final Duration recentActivity;
  final int streakCount;
  final double completionRate;
  final String lastProfileUsed;
  final Map<String, dynamic> environmentContext;
}

class AIResponse {
  final String content;
  final AIResponseType type;
  final double confidence;
  final Map<String, dynamic> metadata;
}

enum AIResponseType {
  motivationalMessage,
  productivityTip,
  profileSuggestion,
  habitInsight,
  goalRecommendation
}
```

## 4. User Interface Architecture

### 4.1 Navigation Structure

```
App Navigation Hierarchy:
├── Home/Timer Screen (Main)
│   ├── Quick Start Timer
│   ├── Profile Selector
│   ├── Sequence Selector
│   └── Current Session Controls
├── Profiles Tab
│   ├── Profile List
│   ├── Create/Edit Profile
│   ├── Sequence Manager
│   └── Import/Export Profiles
├── Analytics Tab
│   ├── Statistics Dashboard
│   ├── Goal Tracking
│   ├── Progress Charts
│   └── Data Export
├── Settings Tab
│   ├── App Preferences
│   ├── Notification Settings
│   ├── Theme Customization
│   ├── AI Coaching Settings
│   └── Privacy Controls
└── AI Assistant (Overlay)
    ├── Quick Tips
    ├── Motivation Messages
    ├── Smart Suggestions
    └── Coaching Insights
```

### 4.2 State Management Architecture

```dart
// Riverpod Providers Structure
final timerEngineProvider = StateNotifierProvider<TimerEngineNotifier, TimerState>((ref) {
  return TimerEngineNotifier(ref.read(databaseServiceProvider));
});

final profileManagerProvider = Provider<ProfileManager>((ref) {
  return ProfileManager(ref.read(databaseServiceProvider));
});

final analyticsServiceProvider = Provider<AnalyticsService>((ref) {
  return AnalyticsService(ref.read(databaseServiceProvider));
});

final aiEngineProvider = StateNotifierProvider<AIEngineNotifier, AIState>((ref) {
  return AIEngineNotifier(ref.read(localAIServiceProvider));
});

final userPreferencesProvider = StateNotifierProvider<UserPreferencesNotifier, UserPreferences>((ref) {
  return UserPreferencesNotifier(ref.read(databaseServiceProvider));
});

// Global App State
final appStateProvider = StateNotifierProvider<AppStateNotifier, AppState>((ref) {
  return AppStateNotifier();
});

class AppState {
  final bool isOnline;
  final bool isFirstLaunch;
  final String currentTheme;
  final NotificationPermissionStatus notificationStatus;
  final bool aiEnabled;
  final Map<String, dynamic> globalSettings;
}
```

### 4.3 UI Component Architecture

```dart
// Main Screen Components
class TimerScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final timerState = ref.watch(timerEngineProvider);
    final profiles = ref.watch(profilesProvider);

    return Scaffold(
      body: Column(
        children: [
          ProfileSelector(profiles: profiles),
          TimerDisplay(state: timerState),
          TimerControls(state: timerState),
          AICoachingWidget(),
        ],
      ),
    );
  }
}

// Reusable UI Components
class TimerDisplay extends StatelessWidget {
  final TimerState state;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: CircularProgressPainter(
        progress: state.progress,
        theme: context.theme.timerTheme,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(state.formattedTimeRemaining),
          Text(state.currentProfile.name),
          if (state.isSequence) SequenceProgressIndicator(state),
        ],
      ),
    );
  }
}

class ProfileSelector extends StatelessWidget {
  final List<Profile> profiles;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 120,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: profiles.length,
        itemBuilder: (context, index) {
          return ProfileCard(profile: profiles[index]);
        },
      ),
    );
  }
}
```

## 5. Background Processing & Notifications

### 5.1 Background Timer Management

```dart
class BackgroundTimerService {
  // Platform-specific background handling
  Future<void> startBackgroundTimer(TimerConfiguration config);
  Future<void> pauseBackgroundTimer();
  Future<void> resumeBackgroundTimer();
  Future<void> stopBackgroundTimer();

  // Notification scheduling
  Future<void> scheduleCompletionNotification(DateTime completionTime);
  Future<void> scheduleBreakReminders(List<DateTime> breakTimes);

  // State synchronization
  Future<void> syncTimerState();
  Stream<BackgroundTimerEvent> get backgroundEvents;
}

// Platform-specific implementations
class AndroidBackgroundService extends BackgroundTimerService {
  // Uses WorkManager for reliable background execution
  @override
  Future<void> startBackgroundTimer(TimerConfiguration config) {
    return WorkManager.enqueue(
      TimerWorker(config: config),
      constraints: Constraints(requiresBatteryNotLow: false),
    );
  }
}

class IOSBackgroundService extends BackgroundTimerService {
  // Uses Background App Refresh and local notifications
  @override
  Future<void> startBackgroundTimer(TimerConfiguration config) {
    // Schedule local notifications for timer completion
    return NotificationService.scheduleTimerNotifications(config);
  }
}
```

### 5.2 Notification System

```dart
class NotificationService {
  // Core notification operations
  Future<void> initialize();
  Future<void> requestPermissions();

  // Timer notifications
  Future<void> showTimerCompleteNotification(Session session);
  Future<void> showBreakReminderNotification();
  Future<void> showMotivationalNotification(String message);

  // Goal and streak notifications
  Future<void> showGoalProgressNotification(Goal goal, double progress);
  Future<void> showStreakAchievementNotification(int streakDays);

  // AI-powered notifications
  Future<void> showSmartReminderNotification(AIRecommendation recommendation);
}

class NotificationConfiguration {
  final bool enableCompletionNotifications;
  final bool enableBreakReminders;
  final bool enableMotivationalMessages;
  final bool enableGoalNotifications;
  final String soundPath;
  final bool vibrationEnabled;
  final NotificationPriority priority;
}
```

## 6. Data Synchronization & Export

### 6.1 Data Export System

```dart
class DataExportService {
  // Profile export/import
  Future<String> exportProfile(String profileId, ExportFormat format);
  Future<String> exportAllProfiles(ExportFormat format);
  Future<Profile> importProfile(String data);

  // Analytics export
  Future<String> exportAnalyticsData(DateRange range, ExportFormat format);
  Future<String> exportSessionHistory(DateRange range, ExportFormat format);

  // Complete data export
  Future<String> exportAllUserData(ExportFormat format);

  // Sharing functionality
  Future<String> createShareableProfile(String profileId);
  Future<void> shareProfile(String profileData, ShareMethod method);
}

enum ExportFormat { json, csv, pdf }
enum ShareMethod { file, qr_code, url }

class ShareableProfile {
  final String id;
  final String name;
  final String description;
  final Map<String, dynamic> configuration;
  final String creatorAttribution;
  final DateTime createdAt;
  final int usageCount;
  final double averageRating;
}
```

### 6.2 Profile Sharing Architecture

```dart
class ProfileSharingService {
  // Local sharing (offline)
  Future<String> generateProfileQRCode(String profileId);
  Future<File> createProfileShareFile(String profileId);
  Future<Profile> importProfileFromFile(File file);
  Future<Profile> importProfileFromQRCode(String qrData);

  // Online sharing (optional)
  Future<void> uploadProfileToRepository(String profileId);
  Future<List<SharedProfile>> browseSharedProfiles(ProfileCategory category);
  Future<void> downloadSharedProfile(String sharedProfileId);
  Future<void> rateSharedProfile(String sharedProfileId, int rating);
}

// No backend database needed - sharing via files/QR codes
class ProfileShareData {
  final Profile profile;
  final String shareId;
  final DateTime createdAt;
  final String creatorInfo;
  final Map<String, dynamic> metadata;

  // Serialization for file sharing
  String toJson();
  static ProfileShareData fromJson(String json);
}
```

## 7. Performance & Optimization

### 7.1 Database Optimization

```dart
class DatabaseOptimizationService {
  // Query optimization
  Future<void> createIndexes();
  Future<void> analyzeQueryPerformance();
  Future<void> optimizeTableStructure();

  // Data cleanup
  Future<void> cleanupOldSessions(Duration retentionPeriod);
  Future<void> compactDatabase();
  Future<void> rebuildIndexes();

  // Cache management
  Future<void> warmupCache();
  Future<void> clearCache();
}

// Database indexes for performance
const List<String> PERFORMANCE_INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);',
  'CREATE INDEX IF NOT EXISTS idx_sessions_profile_id ON sessions(profile_id);',
  'CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON usage_analytics(created_at);',
  'CREATE INDEX IF NOT EXISTS idx_ai_interactions_type ON ai_interactions(interaction_type);',
];
```

### 7.2 Memory Management

```dart
class MemoryManager {
  // Cache management
  final LRUCache<String, Profile> _profileCache = LRUCache(maxSize: 100);
  final LRUCache<String, AIResponse> _aiResponseCache = LRUCache(maxSize: 50);

  // Resource cleanup
  Future<void> cleanupUnusedResources();
  Future<void> optimizeMemoryUsage();

  // Monitoring
  Stream<MemoryUsage> get memoryUsageStream;
  void logMemoryUsage();
}

class ResourcePreloader {
  // Preload critical resources
  Future<void> preloadEssentialProfiles();
  Future<void> preloadAIModel();
  Future<void> preloadAudioAssets();

  // Lazy loading
  Future<T> lazyLoad<T>(String key, Future<T> Function() loader);
}
```

## 8. Security & Privacy Implementation

### 8.1 Data Security

```dart
class DataSecurityService {
  // Encryption
  Future<void> initializeEncryption();
  Future<String> encryptSensitiveData(String data);
  Future<String> decryptSensitiveData(String encryptedData);

  // Secure storage
  Future<void> securelyStoreUserPreferences(Map<String, dynamic> preferences);
  Future<Map<String, dynamic>> retrieveSecureUserPreferences();

  // Data integrity
  Future<bool> validateDataIntegrity();
  Future<void> createDataChecksum();
}

class PrivacyManager {
  // Consent management
  Future<void> setAnalyticsConsent(bool consent);
  Future<void> setAIDataSharingConsent(bool consent);
  Future<bool> getAnalyticsConsent();

  // Data anonymization
  Future<Map<String, dynamic>> anonymizeAnalyticsData(Map<String, dynamic> data);
  Future<void> purgePersonalData();

  // Privacy controls
  Future<void> enablePrivacyMode();
  Future<void> exportPersonalData();
  Future<void> deleteAllPersonalData();
}
```

### 8.2 Error Handling & Logging

```dart
class ErrorHandlingService {
  // Error capture
  void captureError(dynamic error, StackTrace stackTrace, {Map<String, dynamic>? context});
  void captureUserFeedback(String feedback, {String? errorId});

  // Error reporting (with privacy)
  Future<void> reportCriticalErrors();
  Future<void> sendAnonymizedErrorReport();

  // Recovery
  Future<void> attemptAutomaticRecovery(RecoverableError error);
  Future<void> restoreFromBackup();
}

class PerformanceMonitor {
  // Performance metrics
  void trackScreenLoadTime(String screenName, Duration loadTime);
  void trackDatabaseQueryTime(String query, Duration executionTime);
  void trackAIResponseTime(Duration responseTime);

  // Performance alerts
  Stream<PerformanceAlert> get performanceAlerts;
  void setPerformanceThresholds(PerformanceThresholds thresholds);
}
```

## 9. Testing Strategy

### 9.1 Unit Testing Structure

```dart
// Core business logic tests
class TimerEngineTest {
  void testTimerAccuracy();
  void testPauseResumeLogic();
  void testSequenceExecution();
  void testStateTransitions();
}

class ProfileManagerTest {
  void testProfileCRUDOperations();
  void testSequenceCreation();
  void testImportExportFunctionality();
  void testDataValidation();
}

class AIEngineTest {
  void testResponseGeneration();
  void testContextAnalysis();
  void testOfflineOperation();
  void testCacheManagement();
}

// Database tests
class DatabaseTest {
  void testSchemaCreation();
  void testDataIntegrity();
  void testPerformanceQueries();
  void testMigrations();
}
```

### 9.2 Integration Testing

```dart
class IntegrationTest {
  // End-to-end workflows
  void testCompleteTimerSession();
  void testSequenceExecution();
  void testProfileSharingWorkflow();
  void testOfflineOnlineTransition();

  // System integration
  void testNotificationIntegration();
  void testBackgroundProcessing();
  void testFileSystemOperations();
  void testAIModelIntegration();
}

class PerformanceTest {
  void testAppLaunchTime();
  void testTimerAccuracy();
  void testMemoryUsage();
  void testBatteryOptimization();
  void testDatabasePerformance();
}
```

## 10. Deployment & Distribution

### 10.1 Build Configuration

```dart
// Build flavors for different environments
abstract class BuildConfig {
  static const String appName = 'Focus & Productivity Timer';
  static const String packageName = 'com.focusapp.timer';

  // Environment-specific settings
  bool get isProduction;
  bool get enableAnalytics;
  bool get enableCrashReporting;
  String get aiModelVersion;
  Map<String, String> get apiEndpoints;
}

class ProductionConfig extends BuildConfig {
  @override
  bool get isProduction => true;
  @override
  bool get enableAnalytics => false; // Privacy-first
  @override
  bool get enableCrashReporting => true;
  @override
  String get aiModelVersion => 'v2.1';
}

class DevelopmentConfig extends BuildConfig {
  @override
  bool get isProduction => false;
  @override
  bool get enableAnalytics => false;
  @override
  bool get enableCrashReporting => false;
  @override
  String get aiModelVersion => 'v2.1-dev';
}
```

### 10.2 Distribution Strategy

```yaml
# Build pipeline configuration
name: Build and Deploy
on:
  push:
    tags:
      - 'v*'

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - name: Build APK
        run: flutter build apk --release
      - name: Build AAB for Play Store
        run: flutter build appbundle --release

  build-ios:
    runs-on: macos-latest
    steps:
      - name: Build iOS
        run: flutter build ios --release
      - name: Archive for App Store
        run: xcodebuild archive

  direct-distribution:
    needs: [build-android, build-ios]
    steps:
      - name: Create GitHub Release
        run: gh release create
      - name: Upload Direct Download APK
        run: gh release upload
```

## 11. Maintenance & Updates

### 11.1 Update System

```dart
class UpdateManager {
  // Version checking
  Future<UpdateInfo> checkForUpdates();
  Future<bool> isUpdateRequired();
  Future<bool> isUpdateAvailable();

  // In-app updates (Android)
  Future<void> startInAppUpdate(UpdateType type);
  Future<void> completeInAppUpdate();

  // AI model updates
  Future<void> checkForModelUpdates();
  Future<void> downloadModelUpdate(String modelVersion);
  Future<void> applyModelUpdate();
}

class MaintenanceMode {
  // Graceful degradation
  Future<void> enableMaintenanceMode();
  Future<void> disableMaintenanceMode();
  bool get isInMaintenanceMode;

  // Feature toggles
  Future<void> toggleFeature(String featureName, bool enabled);
  Future<bool> isFeatureEnabled(String featureName);
}
```

### 11.2 Analytics & Monitoring

```dart
class AnalyticsService {
  // Usage analytics (privacy-compliant)
  void trackAppLaunch();
  void trackTimerSession(SessionMetrics metrics);
  void trackFeatureUsage(String featureName);
  void trackPerformanceMetric(String metric, double value);

  // Error analytics
  void trackError(String errorType, String context);
  void trackRecoveryAction(String action, bool success);

  // User experience analytics
  void trackUserSatisfaction(int rating);
  void trackFeatureFeedback(String feature, UserFeedback feedback);
}

class HealthMonitor {
  // App health metrics
  Stream<HealthMetric> get healthMetrics;
  Future<HealthReport> generateHealthReport();

  // Alerting
  void setHealthThresholds(HealthThresholds thresholds);
  Stream<HealthAlert> get healthAlerts;
}
```

This comprehensive design document provides the technical blueprint for implementing all requirements while maintaining the offline-first architecture with no cloud database dependency. The system is designed for scalability, maintainability, and optimal user experience across all target platforms.

---

**Questions: libor@arionetworks.com**