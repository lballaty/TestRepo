// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'sequence_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Sequence _$SequenceFromJson(Map<String, dynamic> json) => Sequence(
  id: json['id'] as String,
  name: json['name'] as String,
  description: json['description'] as String?,
  totalDurationMinutes: (json['totalDurationMinutes'] as num?)?.toInt(),
  autoTransition: json['autoTransition'] as bool? ?? true,
  steps:
      (json['steps'] as List<dynamic>)
          .map((e) => SequenceStep.fromJson(e as Map<String, dynamic>))
          .toList(),
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$SequenceToJson(Sequence instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'description': instance.description,
  'totalDurationMinutes': instance.totalDurationMinutes,
  'autoTransition': instance.autoTransition,
  'steps': instance.steps,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
};

SequenceStep _$SequenceStepFromJson(Map<String, dynamic> json) => SequenceStep(
  id: json['id'] as String,
  sequenceId: json['sequenceId'] as String,
  profileId: json['profileId'] as String,
  stepOrder: (json['stepOrder'] as num).toInt(),
  profile:
      json['profile'] == null
          ? null
          : Profile.fromJson(json['profile'] as Map<String, dynamic>),
);

Map<String, dynamic> _$SequenceStepToJson(SequenceStep instance) =>
    <String, dynamic>{
      'id': instance.id,
      'sequenceId': instance.sequenceId,
      'profileId': instance.profileId,
      'stepOrder': instance.stepOrder,
      'profile': instance.profile,
    };

SequenceProgress _$SequenceProgressFromJson(Map<String, dynamic> json) =>
    SequenceProgress(
      sequenceId: json['sequenceId'] as String,
      currentStepIndex: (json['currentStepIndex'] as num).toInt(),
      totalSteps: (json['totalSteps'] as num).toInt(),
      startedAt: DateTime.parse(json['startedAt'] as String),
      pausedAt:
          json['pausedAt'] == null
              ? null
              : DateTime.parse(json['pausedAt'] as String),
      elapsedTime:
          json['elapsedTime'] == null
              ? Duration.zero
              : Duration(microseconds: (json['elapsedTime'] as num).toInt()),
      remainingTime:
          json['remainingTime'] == null
              ? Duration.zero
              : Duration(microseconds: (json['remainingTime'] as num).toInt()),
      status:
          $enumDecodeNullable(
            _$SequenceProgressStatusEnumMap,
            json['status'],
          ) ??
          SequenceProgressStatus.notStarted,
      stepProgress:
          (json['stepProgress'] as List<dynamic>?)
              ?.map((e) => StepProgress.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );

Map<String, dynamic> _$SequenceProgressToJson(SequenceProgress instance) =>
    <String, dynamic>{
      'sequenceId': instance.sequenceId,
      'currentStepIndex': instance.currentStepIndex,
      'totalSteps': instance.totalSteps,
      'startedAt': instance.startedAt.toIso8601String(),
      'pausedAt': instance.pausedAt?.toIso8601String(),
      'elapsedTime': instance.elapsedTime.inMicroseconds,
      'remainingTime': instance.remainingTime.inMicroseconds,
      'status': _$SequenceProgressStatusEnumMap[instance.status]!,
      'stepProgress': instance.stepProgress,
    };

const _$SequenceProgressStatusEnumMap = {
  SequenceProgressStatus.notStarted: 'not_started',
  SequenceProgressStatus.inProgress: 'in_progress',
  SequenceProgressStatus.paused: 'paused',
  SequenceProgressStatus.completed: 'completed',
  SequenceProgressStatus.stopped: 'stopped',
};

StepProgress _$StepProgressFromJson(Map<String, dynamic> json) => StepProgress(
  stepId: json['stepId'] as String,
  stepIndex: (json['stepIndex'] as num).toInt(),
  startedAt:
      json['startedAt'] == null
          ? null
          : DateTime.parse(json['startedAt'] as String),
  completedAt:
      json['completedAt'] == null
          ? null
          : DateTime.parse(json['completedAt'] as String),
  plannedDuration:
      json['plannedDuration'] == null
          ? Duration.zero
          : Duration(microseconds: (json['plannedDuration'] as num).toInt()),
  elapsedDuration:
      json['elapsedDuration'] == null
          ? Duration.zero
          : Duration(microseconds: (json['elapsedDuration'] as num).toInt()),
  status:
      $enumDecodeNullable(_$StepProgressStatusEnumMap, json['status']) ??
      StepProgressStatus.notStarted,
);

Map<String, dynamic> _$StepProgressToJson(StepProgress instance) =>
    <String, dynamic>{
      'stepId': instance.stepId,
      'stepIndex': instance.stepIndex,
      'startedAt': instance.startedAt?.toIso8601String(),
      'completedAt': instance.completedAt?.toIso8601String(),
      'plannedDuration': instance.plannedDuration.inMicroseconds,
      'elapsedDuration': instance.elapsedDuration.inMicroseconds,
      'status': _$StepProgressStatusEnumMap[instance.status]!,
    };

const _$StepProgressStatusEnumMap = {
  StepProgressStatus.notStarted: 'not_started',
  StepProgressStatus.inProgress: 'in_progress',
  StepProgressStatus.paused: 'paused',
  StepProgressStatus.completed: 'completed',
  StepProgressStatus.stopped: 'stopped',
};
