// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'session_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Session _$SessionFromJson(Map<String, dynamic> json) => Session(
  id: json['id'] as String,
  profileId: json['profileId'] as String?,
  sequenceId: json['sequenceId'] as String?,
  startedAt: DateTime.parse(json['startedAt'] as String),
  completedAt:
      json['completedAt'] == null
          ? null
          : DateTime.parse(json['completedAt'] as String),
  plannedDurationMinutes: (json['plannedDurationMinutes'] as num).toInt(),
  actualDurationMinutes: (json['actualDurationMinutes'] as num?)?.toInt(),
  completionStatus:
      $enumDecodeNullable(
        _$CompletionStatusEnumMap,
        json['completionStatus'],
      ) ??
      CompletionStatus.inProgress,
  pauseCount: (json['pauseCount'] as num?)?.toInt() ?? 0,
  totalPauseDurationMinutes:
      (json['totalPauseDurationMinutes'] as num?)?.toInt() ?? 0,
  notes: json['notes'] as String?,
  aiFeedback: json['aiFeedback'] as String?,
);

Map<String, dynamic> _$SessionToJson(Session instance) => <String, dynamic>{
  'id': instance.id,
  'profileId': instance.profileId,
  'sequenceId': instance.sequenceId,
  'startedAt': instance.startedAt.toIso8601String(),
  'completedAt': instance.completedAt?.toIso8601String(),
  'plannedDurationMinutes': instance.plannedDurationMinutes,
  'actualDurationMinutes': instance.actualDurationMinutes,
  'completionStatus': _$CompletionStatusEnumMap[instance.completionStatus]!,
  'pauseCount': instance.pauseCount,
  'totalPauseDurationMinutes': instance.totalPauseDurationMinutes,
  'notes': instance.notes,
  'aiFeedback': instance.aiFeedback,
};

const _$CompletionStatusEnumMap = {
  CompletionStatus.inProgress: 'in_progress',
  CompletionStatus.completed: 'completed',
  CompletionStatus.stopped: 'stopped',
  CompletionStatus.interrupted: 'interrupted',
};

SessionStatistics _$SessionStatisticsFromJson(Map<String, dynamic> json) =>
    SessionStatistics(
      totalSessions: (json['totalSessions'] as num?)?.toInt() ?? 0,
      completedSessions: (json['completedSessions'] as num?)?.toInt() ?? 0,
      totalFocusMinutes: (json['totalFocusMinutes'] as num?)?.toInt() ?? 0,
      totalBreakMinutes: (json['totalBreakMinutes'] as num?)?.toInt() ?? 0,
      averageCompletionRate:
          (json['averageCompletionRate'] as num?)?.toDouble() ?? 0.0,
      averageSessionQuality:
          (json['averageSessionQuality'] as num?)?.toDouble() ?? 0.0,
      currentStreak: (json['currentStreak'] as num?)?.toInt() ?? 0,
      longestStreak: (json['longestStreak'] as num?)?.toInt() ?? 0,
      lastSessionDate:
          json['lastSessionDate'] == null
              ? null
              : DateTime.parse(json['lastSessionDate'] as String),
      profileUsageCount:
          (json['profileUsageCount'] as Map<String, dynamic>?)?.map(
            (k, e) => MapEntry(k, (e as num).toInt()),
          ) ??
          const {},
    );

Map<String, dynamic> _$SessionStatisticsToJson(SessionStatistics instance) =>
    <String, dynamic>{
      'totalSessions': instance.totalSessions,
      'completedSessions': instance.completedSessions,
      'totalFocusMinutes': instance.totalFocusMinutes,
      'totalBreakMinutes': instance.totalBreakMinutes,
      'averageCompletionRate': instance.averageCompletionRate,
      'averageSessionQuality': instance.averageSessionQuality,
      'currentStreak': instance.currentStreak,
      'longestStreak': instance.longestStreak,
      'lastSessionDate': instance.lastSessionDate?.toIso8601String(),
      'profileUsageCount': instance.profileUsageCount,
    };
