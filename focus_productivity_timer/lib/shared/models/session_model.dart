// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/focus_productivity_timer/lib/shared/models/session_model.dart
// Description: Session data model for tracking timer sessions and user activity
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-26

import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'session_model.g.dart';

@JsonSerializable()
class Session extends Equatable {
  final String id;
  final String? profileId;
  final String? sequenceId;
  final DateTime startedAt;
  final DateTime? completedAt;
  final int plannedDurationMinutes;
  final int? actualDurationMinutes;
  final CompletionStatus completionStatus;
  final int pauseCount;
  final int totalPauseDurationMinutes;
  final String? notes;
  final String? aiFeedback;

  const Session({
    required this.id,
    this.profileId,
    this.sequenceId,
    required this.startedAt,
    this.completedAt,
    required this.plannedDurationMinutes,
    this.actualDurationMinutes,
    this.completionStatus = CompletionStatus.inProgress,
    this.pauseCount = 0,
    this.totalPauseDurationMinutes = 0,
    this.notes,
    this.aiFeedback,
  });

  factory Session.fromJson(Map<String, dynamic> json) => _$SessionFromJson(json);
  Map<String, dynamic> toJson() => _$SessionToJson(this);

  factory Session.fromDatabase(Map<String, dynamic> map) {
    return Session(
      id: map['id'] as String,
      profileId: map['profile_id'] as String?,
      sequenceId: map['sequence_id'] as String?,
      startedAt: DateTime.fromMillisecondsSinceEpoch(map['started_at'] as int),
      completedAt: map['completed_at'] != null
          ? DateTime.fromMillisecondsSinceEpoch(map['completed_at'] as int)
          : null,
      plannedDurationMinutes: map['planned_duration_minutes'] as int,
      actualDurationMinutes: map['actual_duration_minutes'] as int?,
      completionStatus: CompletionStatus.values.firstWhere(
        (status) => status.value == map['completion_status'] as String,
        orElse: () => CompletionStatus.inProgress,
      ),
      pauseCount: map['pause_count'] as int? ?? 0,
      totalPauseDurationMinutes: map['total_pause_duration_minutes'] as int? ?? 0,
      notes: map['notes'] as String?,
      aiFeedback: map['ai_feedback'] as String?,
    );
  }

  Map<String, dynamic> toDatabase() {
    return {
      'id': id,
      'profile_id': profileId,
      'sequence_id': sequenceId,
      'started_at': startedAt.millisecondsSinceEpoch,
      'completed_at': completedAt?.millisecondsSinceEpoch,
      'planned_duration_minutes': plannedDurationMinutes,
      'actual_duration_minutes': actualDurationMinutes,
      'completion_status': completionStatus.value,
      'pause_count': pauseCount,
      'total_pause_duration_minutes': totalPauseDurationMinutes,
      'notes': notes,
      'ai_feedback': aiFeedback,
    };
  }

  Session copyWith({
    String? id,
    String? profileId,
    String? sequenceId,
    DateTime? startedAt,
    DateTime? completedAt,
    int? plannedDurationMinutes,
    int? actualDurationMinutes,
    CompletionStatus? completionStatus,
    int? pauseCount,
    int? totalPauseDurationMinutes,
    String? notes,
    String? aiFeedback,
  }) {
    return Session(
      id: id ?? this.id,
      profileId: profileId ?? this.profileId,
      sequenceId: sequenceId ?? this.sequenceId,
      startedAt: startedAt ?? this.startedAt,
      completedAt: completedAt ?? this.completedAt,
      plannedDurationMinutes: plannedDurationMinutes ?? this.plannedDurationMinutes,
      actualDurationMinutes: actualDurationMinutes ?? this.actualDurationMinutes,
      completionStatus: completionStatus ?? this.completionStatus,
      pauseCount: pauseCount ?? this.pauseCount,
      totalPauseDurationMinutes: totalPauseDurationMinutes ?? this.totalPauseDurationMinutes,
      notes: notes ?? this.notes,
      aiFeedback: aiFeedback ?? this.aiFeedback,
    );
  }

  Duration get plannedDuration => Duration(minutes: plannedDurationMinutes);
  Duration? get actualDuration =>
      actualDurationMinutes != null ? Duration(minutes: actualDurationMinutes!) : null;
  Duration get totalPauseDuration => Duration(minutes: totalPauseDurationMinutes);

  bool get isCompleted => completionStatus == CompletionStatus.completed;
  bool get isInProgress => completionStatus == CompletionStatus.inProgress;
  bool get wasStopped => completionStatus == CompletionStatus.stopped;
  bool get wasInterrupted => completionStatus == CompletionStatus.interrupted;

  double get completionPercentage {
    if (actualDurationMinutes == null) return 0.0;
    if (plannedDurationMinutes == 0) return 0.0;
    return (actualDurationMinutes! / plannedDurationMinutes).clamp(0.0, 1.0);
  }

  Duration get sessionDuration {
    if (completedAt == null) return Duration.zero;
    return completedAt!.difference(startedAt);
  }

  Duration get effectiveFocusTime {
    final totalSession = sessionDuration;
    return totalSession - totalPauseDuration;
  }

  bool get hadPauses => pauseCount > 0;
  bool get isLongSession => plannedDurationMinutes >= 45;
  bool get isShortSession => plannedDurationMinutes <= 15;

  SessionQuality get quality {
    if (!isCompleted) return SessionQuality.incomplete;

    final completionRate = completionPercentage;
    final pauseRate = totalPauseDurationMinutes / plannedDurationMinutes;

    if (completionRate >= 0.95 && pauseRate <= 0.1) {
      return SessionQuality.excellent;
    } else if (completionRate >= 0.8 && pauseRate <= 0.2) {
      return SessionQuality.good;
    } else if (completionRate >= 0.6 && pauseRate <= 0.4) {
      return SessionQuality.fair;
    } else {
      return SessionQuality.poor;
    }
  }

  @override
  List<Object?> get props => [
        id,
        profileId,
        sequenceId,
        startedAt,
        completedAt,
        plannedDurationMinutes,
        actualDurationMinutes,
        completionStatus,
        pauseCount,
        totalPauseDurationMinutes,
        notes,
        aiFeedback,
      ];
}

enum CompletionStatus {
  @JsonValue('in_progress')
  inProgress('in_progress'),
  @JsonValue('completed')
  completed('completed'),
  @JsonValue('stopped')
  stopped('stopped'),
  @JsonValue('interrupted')
  interrupted('interrupted');

  const CompletionStatus(this.value);
  final String value;
}

enum SessionQuality {
  excellent,
  good,
  fair,
  poor,
  incomplete,
}

extension CompletionStatusExtension on CompletionStatus {
  String get displayName {
    switch (this) {
      case CompletionStatus.inProgress:
        return 'In Progress';
      case CompletionStatus.completed:
        return 'Completed';
      case CompletionStatus.stopped:
        return 'Stopped';
      case CompletionStatus.interrupted:
        return 'Interrupted';
    }
  }

  String get description {
    switch (this) {
      case CompletionStatus.inProgress:
        return 'Session is currently active';
      case CompletionStatus.completed:
        return 'Session completed successfully';
      case CompletionStatus.stopped:
        return 'Session was stopped manually';
      case CompletionStatus.interrupted:
        return 'Session was interrupted unexpectedly';
    }
  }

  bool get isActive => this == CompletionStatus.inProgress;
  bool get isFinished => this != CompletionStatus.inProgress;
}

extension SessionQualityExtension on SessionQuality {
  String get displayName {
    switch (this) {
      case SessionQuality.excellent:
        return 'Excellent';
      case SessionQuality.good:
        return 'Good';
      case SessionQuality.fair:
        return 'Fair';
      case SessionQuality.poor:
        return 'Poor';
      case SessionQuality.incomplete:
        return 'Incomplete';
    }
  }

  String get description {
    switch (this) {
      case SessionQuality.excellent:
        return 'Outstanding focus with minimal interruptions';
      case SessionQuality.good:
        return 'Strong focus with few interruptions';
      case SessionQuality.fair:
        return 'Moderate focus with some interruptions';
      case SessionQuality.poor:
        return 'Limited focus with frequent interruptions';
      case SessionQuality.incomplete:
        return 'Session was not completed';
    }
  }

  String get emoji {
    switch (this) {
      case SessionQuality.excellent:
        return '🌟';
      case SessionQuality.good:
        return '✅';
      case SessionQuality.fair:
        return '⚡';
      case SessionQuality.poor:
        return '⚠️';
      case SessionQuality.incomplete:
        return '❌';
    }
  }

  double get score {
    switch (this) {
      case SessionQuality.excellent:
        return 1.0;
      case SessionQuality.good:
        return 0.8;
      case SessionQuality.fair:
        return 0.6;
      case SessionQuality.poor:
        return 0.4;
      case SessionQuality.incomplete:
        return 0.0;
    }
  }
}

@JsonSerializable()
class SessionStatistics extends Equatable {
  final int totalSessions;
  final int completedSessions;
  final int totalFocusMinutes;
  final int totalBreakMinutes;
  final double averageCompletionRate;
  final double averageSessionQuality;
  final int currentStreak;
  final int longestStreak;
  final DateTime? lastSessionDate;
  final Map<String, int> profileUsageCount;

  const SessionStatistics({
    this.totalSessions = 0,
    this.completedSessions = 0,
    this.totalFocusMinutes = 0,
    this.totalBreakMinutes = 0,
    this.averageCompletionRate = 0.0,
    this.averageSessionQuality = 0.0,
    this.currentStreak = 0,
    this.longestStreak = 0,
    this.lastSessionDate,
    this.profileUsageCount = const {},
  });

  factory SessionStatistics.fromJson(Map<String, dynamic> json) => _$SessionStatisticsFromJson(json);
  Map<String, dynamic> toJson() => _$SessionStatisticsToJson(this);

  SessionStatistics copyWith({
    int? totalSessions,
    int? completedSessions,
    int? totalFocusMinutes,
    int? totalBreakMinutes,
    double? averageCompletionRate,
    double? averageSessionQuality,
    int? currentStreak,
    int? longestStreak,
    DateTime? lastSessionDate,
    Map<String, int>? profileUsageCount,
  }) {
    return SessionStatistics(
      totalSessions: totalSessions ?? this.totalSessions,
      completedSessions: completedSessions ?? this.completedSessions,
      totalFocusMinutes: totalFocusMinutes ?? this.totalFocusMinutes,
      totalBreakMinutes: totalBreakMinutes ?? this.totalBreakMinutes,
      averageCompletionRate: averageCompletionRate ?? this.averageCompletionRate,
      averageSessionQuality: averageSessionQuality ?? this.averageSessionQuality,
      currentStreak: currentStreak ?? this.currentStreak,
      longestStreak: longestStreak ?? this.longestStreak,
      lastSessionDate: lastSessionDate ?? this.lastSessionDate,
      profileUsageCount: profileUsageCount ?? this.profileUsageCount,
    );
  }

  Duration get totalFocusTime => Duration(minutes: totalFocusMinutes);
  Duration get totalBreakTime => Duration(minutes: totalBreakMinutes);
  Duration get totalTime => Duration(minutes: totalFocusMinutes + totalBreakMinutes);

  double get completionRate => totalSessions > 0 ? completedSessions / totalSessions : 0.0;

  bool get hasRecentActivity => lastSessionDate != null &&
      DateTime.now().difference(lastSessionDate!).inDays < 7;

  String get mostUsedProfile {
    if (profileUsageCount.isEmpty) return '';

    return profileUsageCount.entries
        .reduce((a, b) => a.value > b.value ? a : b)
        .key;
  }

  @override
  List<Object?> get props => [
        totalSessions,
        completedSessions,
        totalFocusMinutes,
        totalBreakMinutes,
        averageCompletionRate,
        averageSessionQuality,
        currentStreak,
        longestStreak,
        lastSessionDate,
        profileUsageCount,
      ];
}