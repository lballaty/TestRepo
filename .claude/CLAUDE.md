# Focus & Productivity Timer App - Project Development Standards

## Project Overview
Flutter-based Focus & Productivity Timer App: Offline-first mobile application for time management, habit building, and productivity coaching. Supports iOS/Android with optional Supabase cloud features for profile sharing and community.

## Tech Stack Requirements (ENFORCED)

**Frontend:** Flutter 3.16+, Dart 3.2+
**Local Storage:** SQLite via sqflite package
**Backend:** Supabase (optional online features only)
**State Management:** Provider or Riverpod (to be decided)
**Local AI:** TensorFlow Lite or ONNX Runtime
**Platforms:** iOS 13.0+, Android 8.0 (API level 26)+

## Flutter Architecture Standards (ENFORCED)

**Directory Structure (MANDATORY):**
```
lib/
├── core/                    # Core utilities and constants
│   ├── constants/          # App constants, strings, colors
│   ├── utils/             # Helper functions, extensions
│   └── errors/            # Error handling classes
├── features/              # Feature-based organization
│   ├── timer/            # Timer functionality
│   │   ├── data/         # Data sources, repositories
│   │   ├── domain/       # Business logic, entities
│   │   └── presentation/ # Widgets, screens, providers
│   ├── profiles/         # Profile management
│   ├── analytics/        # Progress tracking
│   └── settings/         # App configuration
├── shared/               # Shared components
│   ├── widgets/         # Reusable widgets
│   ├── services/        # App services
│   └── models/          # Data models
└── main.dart           # App entry point
```

## Widget Architecture Standards (ENFORCED)

**Screen Widget Pattern:**
```dart
// File: /lib/features/timer/presentation/screens/timer_session_screen.dart
// Description: Main screen for running focus timer sessions

class TimerSessionScreen extends StatefulWidget {
  const TimerSessionScreen({
    Key? key,
    required this.selectedProfile,
  }) : super(key: key);
  
  final TimerProfile selectedProfile;
  
  @override
  State<TimerSessionScreen> createState() => _TimerSessionScreenState();
}
```

**Service Pattern:**
```dart
// File: /lib/features/timer/data/services/local_timer_service.dart
// Description: Local timer data persistence and retrieval service

class LocalTimerDataService {
  /// Save completed focus session to SQLite database.
  /// 
  /// Business Purpose: Tracks user productivity patterns for
  /// analytics and AI coaching suggestions locally.
  Future<bool> saveCompletedFocusSession(FocusSessionData sessionData) async {
    // Implementation
  }
}
```

## State Management Standards (ENFORCED)

**Provider Pattern (if using Provider):**
```dart
// File: /lib/features/timer/presentation/providers/timer_session_provider.dart
// Description: State management for active timer sessions

class TimerSessionProvider with ChangeNotifier {
  Duration _remainingDuration = Duration.zero;
  TimerStatus _currentStatus = TimerStatus.stopped;
  
  /// Get current remaining time in timer session.
  /// Updates UI components that display countdown.
  Duration get remainingDuration => _remainingDuration;
  
  /// Start focus timer with specified duration.
  /// 
  /// Business Purpose: Begins user productivity session with
  /// visual feedback and progress tracking.
  void startFocusTimer(Duration initialDuration) {
    // Implementation
  }
}
```

## Database Schema Standards (ENFORCED)

**SQLite Local Schema:**
```sql
-- File: /lib/core/database/schema/focus_sessions_table.sql
-- Description: Local storage for completed focus sessions

CREATE TABLE focus_sessions (
  session_identifier TEXT PRIMARY KEY,     -- NOT session_id
  user_profile_name TEXT NOT NULL,         -- NOT profile
  session_start_timestamp INTEGER NOT NULL, -- NOT start_time
  planned_duration_minutes INTEGER NOT NULL, -- NOT duration
  actual_completion_minutes INTEGER,        -- NOT actual
  completion_status TEXT NOT NULL,         -- completed/paused/cancelled
  interruption_count INTEGER DEFAULT 0,    -- NOT interruptions
  productivity_rating INTEGER,             -- 1-5 user rating
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE timer_profiles (
  profile_identifier TEXT PRIMARY KEY,     -- NOT profile_id
  profile_display_name TEXT NOT NULL,      -- NOT name
  profile_description TEXT,
  timer_duration_minutes INTEGER NOT NULL, -- NOT duration
  break_duration_minutes INTEGER,          -- NOT break_time
  notification_sound_path TEXT,
  visual_theme_name TEXT,
  focus_mode_enabled BOOLEAN DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

**Supabase Cloud Schema (Optional Features):**
```sql
-- File: /supabase/migrations/001_shared_profiles.sql
-- Description: Cloud storage for shared timer profiles

CREATE TABLE shared_timer_profiles (
  profile_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_user_id UUID REFERENCES auth.users(id),
  profile_name TEXT NOT NULL,
  profile_description TEXT,
  timer_settings JSONB NOT NULL,
  download_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Flutter-Specific Patterns (ENFORCED)

**Timer Widget Implementation:**
```dart
// File: /lib/features/timer/presentation/widgets/circular_timer_display.dart
// Description: Circular progress timer display with countdown

class CircularTimerDisplayWidget extends StatefulWidget {
  /// Circular timer display showing countdown progress.
  /// 
  /// Business Purpose: Provides users with intuitive visual
  /// representation of focus session progress to maintain
  /// concentration and motivation.
  const CircularTimerDisplayWidget({
    Key? key,
    required this.remainingDuration,
    required this.totalDuration,
    this.onTimerComplete,
  }) : super(key: key);
}
```

**Offline-First Data Flow:**
```dart
// File: /lib/features/analytics/data/repositories/analytics_repository.dart
// Description: Analytics data with offline-first synchronization

class ProductivityAnalyticsRepository {
  final LocalTimerDataService _localService;
  final SupabaseAnalyticsService? _cloudService; // Optional
  
  /// Get user productivity statistics with offline-first approach.
  /// 
  /// Business Purpose: Provides users with insights about their
  /// productivity patterns for habit improvement, working offline
  /// first and syncing when connectivity available.
  Future<ProductivityAnalytics> getUserProductivityStats({
    required DateRange dateRange,
    bool forceCloudSync = false,
  }) async {
    // Always try local first
    final localStats = await _localService.getProductivityStats(dateRange);
    
    // Optionally sync with cloud if available
    if (_cloudService != null && forceCloudSync) {
      try {
        await _cloudService.syncAnalyticsData(localStats);
      } catch (e) {
        // Fail gracefully - offline data is primary
      }
    }
    
    return localStats;
  }
}
```

## Mobile-Specific Requirements (ENFORCED)

**Background Timer Handling:**
```dart
// File: /lib/core/services/background_timer_service.dart
// Description: Background timer service for continued operation

class BackgroundTimerService {
  /// Ensure timer continues running when app backgrounded.
  /// 
  /// Business Purpose: Users expect focus sessions to continue
  /// even when they switch apps or lock device screen.
  Future<void> setupBackgroundTimerExecution() async {
    // Use workmanager or similar for background tasks
  }
}
```

**Battery Optimization:**
```dart
// File: /lib/core/services/battery_optimization_service.dart
// Description: Battery-conscious timer operations

class BatteryOptimizationService {
  /// Optimize timer display for battery conservation.
  /// 
  /// Business Purpose: Long focus sessions shouldn't drain
  /// user's battery excessively.
  void optimizeForBatteryLife({
    required bool isTimerRunning,
    required bool isScreenVisible,
  }) {
    // Reduce animation frequency when screen off
    // Lower screen brightness during long sessions
    // Pause unnecessary background processes
  }
}
```

## AI Integration Standards (ENFORCED)

**Local AI for Coaching:**
```dart
// File: /lib/features/ai_coaching/data/services/local_ai_service.dart
// Description: Local AI processing for productivity insights

class LocalProductivityAIService {
  /// Generate personalized productivity suggestions using local AI.
  /// 
  /// Business Purpose: Provides users with intelligent coaching
  /// based on their usage patterns without sending data to cloud.
  /// 
  /// Privacy Note: All processing happens on device.
  Future<List<ProductivitySuggestion>> generateCoachingSuggestions(
    ProductivityAnalytics userStats,
  ) async {
    // Use TensorFlow Lite model for local inference
    // Analyze patterns in completion rates, best focus times
    // Generate actionable suggestions
  }
}
```

## Testing Requirements (ENFORCED)

**Flutter Widget Tests:**
```bash
# Run before any UI changes
flutter test test/widgets/
flutter test test/features/timer/presentation/
```

**Integration Tests:**
```bash
# Test complete user flows
flutter test integration_test/timer_session_flow_test.dart
flutter test integration_test/profile_creation_flow_test.dart
```

**Mobile-Specific Tests:**
- Background/foreground state transitions
- Device orientation changes  
- Platform-specific behavior (iOS vs Android)
- Battery optimization effectiveness
- Offline functionality completeness

**Required Test Categories:**

**Timer Accuracy Tests:**
```dart
testWidgets('Timer countdown displays accurate remaining time', (tester) async {
  // Business Purpose: Users depend on timer accuracy for
  // productivity sessions - inaccuracy breaks trust
});
```

**Offline Functionality Tests:**
```dart
testWidgets('All core features work without internet', (tester) async {
  // Business Purpose: App must be fully functional offline
  // as promised to users
});
```

**Data Persistence Tests:**
```dart
test('Session data survives app restart', () async {
  // Business Purpose: Users' productivity history must not
  // be lost due to app crashes or device restarts
});
```

## Performance Standards (ENFORCED)

**Flutter Performance Requirements:**
- App launch under 2 seconds on mid-range devices
- Smooth 60 FPS animations throughout
- Widget rebuilds optimized (use const constructors)
- Memory usage under 100MB during normal operation
- Fast SQLite queries (<100ms for typical operations)

## Quality Gates (ENFORCED)

**Before any commit:**
1. Flutter widget tests pass
2. Integration tests pass  
3. Performance benchmarks met
4. Offline functionality verified
5. Battery usage acceptable
6. Cross-platform consistency confirmed

This ensures the Focus & Productivity Timer App maintains high quality, user-friendly mobile experience with reliable offline-first functionality.