// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/focus_productivity_timer/lib/shared/providers/timer_provider.dart
// Description: Timer state management and business logic providers
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-26

import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import '../models/profile_model.dart';
import '../models/session_model.dart';
import '../models/sequence_model.dart';

/// Current timer state
enum TimerStatus {
  idle,
  running,
  paused,
  completed,
  stopped,
  transitioning, // Between sequence steps
}

/// Timer configuration for starting a session
class TimerConfiguration {
  final String? profileId;
  final String? sequenceId;
  final Duration duration;
  final bool isSequence;
  final List<SequenceStep>? sequenceSteps;
  final Profile? profile;
  final Sequence? sequence;

  const TimerConfiguration({
    this.profileId,
    this.sequenceId,
    required this.duration,
    this.isSequence = false,
    this.sequenceSteps,
    this.profile,
    this.sequence,
  });

  TimerConfiguration copyWith({
    String? profileId,
    String? sequenceId,
    Duration? duration,
    bool? isSequence,
    List<SequenceStep>? sequenceSteps,
    Profile? profile,
    Sequence? sequence,
  }) {
    return TimerConfiguration(
      profileId: profileId ?? this.profileId,
      sequenceId: sequenceId ?? this.sequenceId,
      duration: duration ?? this.duration,
      isSequence: isSequence ?? this.isSequence,
      sequenceSteps: sequenceSteps ?? this.sequenceSteps,
      profile: profile ?? this.profile,
      sequence: sequence ?? this.sequence,
    );
  }
}

/// Current timer state
class TimerState {
  final TimerStatus status;
  final Duration totalDuration;
  final Duration remaining;
  final Duration elapsed;
  final TimerConfiguration? configuration;
  final Session? currentSession;
  final SequenceProgress? sequenceProgress;
  final DateTime? startedAt;
  final DateTime? pausedAt;
  final int pauseCount;
  final Duration totalPauseTime;
  final String? errorMessage;

  const TimerState({
    this.status = TimerStatus.idle,
    this.totalDuration = Duration.zero,
    this.remaining = Duration.zero,
    this.elapsed = Duration.zero,
    this.configuration,
    this.currentSession,
    this.sequenceProgress,
    this.startedAt,
    this.pausedAt,
    this.pauseCount = 0,
    this.totalPauseTime = Duration.zero,
    this.errorMessage,
  });

  TimerState copyWith({
    TimerStatus? status,
    Duration? totalDuration,
    Duration? remaining,
    Duration? elapsed,
    TimerConfiguration? configuration,
    Session? currentSession,
    SequenceProgress? sequenceProgress,
    DateTime? startedAt,
    DateTime? pausedAt,
    int? pauseCount,
    Duration? totalPauseTime,
    String? errorMessage,
  }) {
    return TimerState(
      status: status ?? this.status,
      totalDuration: totalDuration ?? this.totalDuration,
      remaining: remaining ?? this.remaining,
      elapsed: elapsed ?? this.elapsed,
      configuration: configuration ?? this.configuration,
      currentSession: currentSession ?? this.currentSession,
      sequenceProgress: sequenceProgress ?? this.sequenceProgress,
      startedAt: startedAt ?? this.startedAt,
      pausedAt: pausedAt ?? this.pausedAt,
      pauseCount: pauseCount ?? this.pauseCount,
      totalPauseTime: totalPauseTime ?? this.totalPauseTime,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  // Computed properties
  bool get isRunning => status == TimerStatus.running;
  bool get isPaused => status == TimerStatus.paused;
  bool get isCompleted => status == TimerStatus.completed;
  bool get isStopped => status == TimerStatus.stopped;
  bool get isIdle => status == TimerStatus.idle;
  bool get isTransitioning => status == TimerStatus.transitioning;
  bool get isActive => isRunning || isPaused || isTransitioning;

  double get progress {
    if (totalDuration == Duration.zero) return 0.0;
    return (elapsed.inMilliseconds / totalDuration.inMilliseconds).clamp(0.0, 1.0);
  }

  bool get isSequence => configuration?.isSequence ?? false;
  int get currentStepIndex => sequenceProgress?.currentStepIndex ?? 0;
  int get totalSteps => sequenceProgress?.totalSteps ?? 1;

  String get formattedTimeRemaining {
    final minutes = remaining.inMinutes;
    final seconds = remaining.inSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  String get formattedTimeElapsed {
    final minutes = elapsed.inMinutes;
    final seconds = elapsed.inSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TimerState &&
          runtimeType == other.runtimeType &&
          status == other.status &&
          totalDuration == other.totalDuration &&
          remaining == other.remaining &&
          elapsed == other.elapsed &&
          pauseCount == other.pauseCount;

  @override
  int get hashCode =>
      status.hashCode ^
      totalDuration.hashCode ^
      remaining.hashCode ^
      elapsed.hashCode ^
      pauseCount.hashCode;
}

/// Timer state notifier
class TimerNotifier extends StateNotifier<TimerState> {
  Timer? _timer;
  final Uuid _uuid = const Uuid();

  TimerNotifier() : super(const TimerState());

  /// Start a timer with the given configuration
  Future<void> startTimer(TimerConfiguration configuration) async {
    if (state.isActive) {
      throw Exception('Timer is already running');
    }

    final now = DateTime.now();
    final sessionId = _uuid.v4();

    // Create session
    final session = Session(
      id: sessionId,
      profileId: configuration.profileId,
      sequenceId: configuration.sequenceId,
      startedAt: now,
      plannedDurationMinutes: configuration.duration.inMinutes,
      completionStatus: CompletionStatus.inProgress,
    );

    // Create sequence progress if needed
    SequenceProgress? sequenceProgress;
    if (configuration.isSequence && configuration.sequenceSteps != null) {
      sequenceProgress = SequenceProgress(
        sequenceId: configuration.sequenceId!,
        currentStepIndex: 0,
        totalSteps: configuration.sequenceSteps!.length,
        startedAt: now,
        status: SequenceProgressStatus.inProgress,
        stepProgress: configuration.sequenceSteps!
            .asMap()
            .entries
            .map((entry) => StepProgress(
                  stepId: entry.value.id,
                  stepIndex: entry.key,
                  plannedDuration: entry.value.duration,
                ))
            .toList(),
      );
    }

    state = TimerState(
      status: TimerStatus.running,
      totalDuration: configuration.duration,
      remaining: configuration.duration,
      elapsed: Duration.zero,
      configuration: configuration,
      currentSession: session,
      sequenceProgress: sequenceProgress,
      startedAt: now,
    );

    _startTicking();
  }

  /// Pause the current timer
  void pauseTimer() {
    if (!state.isRunning) return;

    _timer?.cancel();
    final now = DateTime.now();

    state = state.copyWith(
      status: TimerStatus.paused,
      pausedAt: now,
      pauseCount: state.pauseCount + 1,
    );
  }

  /// Resume a paused timer
  void resumeTimer() {
    if (!state.isPaused) return;

    final now = DateTime.now();
    final pauseDuration = state.pausedAt != null ? now.difference(state.pausedAt!) : Duration.zero;

    state = state.copyWith(
      status: TimerStatus.running,
      pausedAt: null,
      totalPauseTime: state.totalPauseTime + pauseDuration,
    );

    _startTicking();
  }

  /// Stop the current timer
  void stopTimer() {
    _timer?.cancel();

    if (state.currentSession != null) {
      final now = DateTime.now();
      final actualDuration = now.difference(state.startedAt!);

      final updatedSession = state.currentSession!.copyWith(
        completedAt: now,
        actualDurationMinutes: actualDuration.inMinutes,
        completionStatus: CompletionStatus.stopped,
        pauseCount: state.pauseCount,
        totalPauseDurationMinutes: state.totalPauseTime.inMinutes,
      );

      state = state.copyWith(
        status: TimerStatus.stopped,
        currentSession: updatedSession,
      );
    } else {
      state = state.copyWith(status: TimerStatus.stopped);
    }
  }

  /// Skip to next step in sequence
  void skipToNext() {
    if (!state.isSequence || state.sequenceProgress == null) return;

    final sequenceProgress = state.sequenceProgress!;
    if (sequenceProgress.currentStepIndex < sequenceProgress.totalSteps - 1) {
      final nextIndex = sequenceProgress.currentStepIndex + 1;
      final nextStep = state.configuration!.sequenceSteps![nextIndex];

      final updatedProgress = sequenceProgress.copyWith(
        currentStepIndex: nextIndex,
        status: SequenceProgressStatus.inProgress,
      );

      final updatedConfig = state.configuration!.copyWith(
        duration: nextStep.duration,
      );

      state = state.copyWith(
        status: TimerStatus.running,
        totalDuration: nextStep.duration,
        remaining: nextStep.duration,
        elapsed: Duration.zero,
        configuration: updatedConfig,
        sequenceProgress: updatedProgress,
        startedAt: DateTime.now(),
      );

      _timer?.cancel();
      _startTicking();
    } else {
      _completeTimer();
    }
  }

  /// Reset timer to idle state
  void resetTimer() {
    _timer?.cancel();
    state = const TimerState();
  }

  /// Private method to start the timer ticking
  void _startTicking() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }

      final now = DateTime.now();
      final totalElapsed = now.difference(state.startedAt!) - state.totalPauseTime;
      final remaining = state.totalDuration - totalElapsed;

      if (remaining <= Duration.zero) {
        _completeTimer();
        return;
      }

      state = state.copyWith(
        elapsed: totalElapsed,
        remaining: remaining,
      );
    });
  }

  /// Private method to complete the timer
  void _completeTimer() {
    _timer?.cancel();

    final now = DateTime.now();

    if (state.currentSession != null) {
      final actualDuration = now.difference(state.startedAt!);

      final updatedSession = state.currentSession!.copyWith(
        completedAt: now,
        actualDurationMinutes: actualDuration.inMinutes,
        completionStatus: CompletionStatus.completed,
        pauseCount: state.pauseCount,
        totalPauseDurationMinutes: state.totalPauseTime.inMinutes,
      );

      state = state.copyWith(
        status: TimerStatus.completed,
        remaining: Duration.zero,
        elapsed: state.totalDuration,
        currentSession: updatedSession,
      );
    } else {
      state = state.copyWith(
        status: TimerStatus.completed,
        remaining: Duration.zero,
        elapsed: state.totalDuration,
      );
    }

    // Check if we need to move to next sequence step
    if (state.isSequence && state.sequenceProgress != null) {
      final sequenceProgress = state.sequenceProgress!;
      if (sequenceProgress.currentStepIndex < sequenceProgress.totalSteps - 1 &&
          state.configuration!.sequence?.autoTransition == true) {
        // Auto-transition to next step after a brief delay
        Future.delayed(const Duration(seconds: 3), () {
          if (mounted) skipToNext();
        });
      }
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}

/// Timer state provider
final timerProvider = StateNotifierProvider<TimerNotifier, TimerState>((ref) {
  return TimerNotifier();
});

/// Convenience providers for specific timer properties
final timerStatusProvider = Provider<TimerStatus>((ref) {
  return ref.watch(timerProvider).status;
});

final timerProgressProvider = Provider<double>((ref) {
  return ref.watch(timerProvider).progress;
});

final timerRemainingProvider = Provider<Duration>((ref) {
  return ref.watch(timerProvider).remaining;
});

final timerElapsedProvider = Provider<Duration>((ref) {
  return ref.watch(timerProvider).elapsed;
});

final currentSessionProvider = Provider<Session?>((ref) {
  return ref.watch(timerProvider).currentSession;
});

final isTimerActiveProvider = Provider<bool>((ref) {
  return ref.watch(timerProvider).isActive;
});

final isSequenceRunningProvider = Provider<bool>((ref) {
  return ref.watch(timerProvider).isSequence;
});

final sequenceProgressProvider = Provider<SequenceProgress?>((ref) {
  return ref.watch(timerProvider).sequenceProgress;
});

/// Timer actions provider for UI controls
final timerActionsProvider = Provider<TimerActions>((ref) {
  return TimerActions(ref);
});

/// Timer actions class for encapsulating timer operations
class TimerActions {
  final Ref _ref;

  TimerActions(this._ref);

  Future<void> startTimer(TimerConfiguration configuration) async {
    await _ref.read(timerProvider.notifier).startTimer(configuration);
  }

  void pauseTimer() {
    _ref.read(timerProvider.notifier).pauseTimer();
  }

  void resumeTimer() {
    _ref.read(timerProvider.notifier).resumeTimer();
  }

  void stopTimer() {
    _ref.read(timerProvider.notifier).stopTimer();
  }

  void skipToNext() {
    _ref.read(timerProvider.notifier).skipToNext();
  }

  void resetTimer() {
    _ref.read(timerProvider.notifier).resetTimer();
  }
}