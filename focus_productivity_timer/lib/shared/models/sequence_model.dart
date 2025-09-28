// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/focus_productivity_timer/lib/shared/models/sequence_model.dart
// Description: Sequence data model for multi-step timer workflows and routines
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-26

import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';
import 'profile_model.dart';

part 'sequence_model.g.dart';

@JsonSerializable()
class Sequence extends Equatable {
  final String id;
  final String name;
  final String? description;
  final int? totalDurationMinutes;
  final bool autoTransition;
  final List<SequenceStep> steps;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Sequence({
    required this.id,
    required this.name,
    this.description,
    this.totalDurationMinutes,
    this.autoTransition = true,
    required this.steps,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Sequence.fromJson(Map<String, dynamic> json) => _$SequenceFromJson(json);
  Map<String, dynamic> toJson() => _$SequenceToJson(this);

  factory Sequence.fromDatabase({
    required Map<String, dynamic> sequenceData,
    required List<SequenceStep> sequenceSteps,
  }) {
    return Sequence(
      id: sequenceData['id'] as String,
      name: sequenceData['name'] as String,
      description: sequenceData['description'] as String?,
      totalDurationMinutes: sequenceData['total_duration_minutes'] as int?,
      autoTransition: (sequenceData['auto_transition'] as int? ?? 1) == 1,
      steps: sequenceSteps,
      createdAt: DateTime.fromMillisecondsSinceEpoch(sequenceData['created_at'] as int),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(sequenceData['updated_at'] as int),
    );
  }

  Map<String, dynamic> toDatabase() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'total_duration_minutes': totalDurationMinutes,
      'auto_transition': autoTransition ? 1 : 0,
      'created_at': createdAt.millisecondsSinceEpoch,
      'updated_at': updatedAt.millisecondsSinceEpoch,
    };
  }

  Sequence copyWith({
    String? id,
    String? name,
    String? description,
    int? totalDurationMinutes,
    bool? autoTransition,
    List<SequenceStep>? steps,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Sequence(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      totalDurationMinutes: totalDurationMinutes ?? this.totalDurationMinutes,
      autoTransition: autoTransition ?? this.autoTransition,
      steps: steps ?? this.steps,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Duration get totalDuration => Duration(minutes: calculatedDurationMinutes);

  int get calculatedDurationMinutes {
    if (totalDurationMinutes != null) return totalDurationMinutes!;
    return steps.fold(0, (total, step) => total + step.durationMinutes);
  }

  int get stepCount => steps.length;
  bool get isEmpty => steps.isEmpty;
  bool get isNotEmpty => steps.isNotEmpty;
  bool get hasMultipleSteps => steps.length > 1;

  SequenceStep? getStep(int index) {
    if (index < 0 || index >= steps.length) return null;
    return steps[index];
  }

  SequenceStep? get firstStep => steps.isNotEmpty ? steps.first : null;
  SequenceStep? get lastStep => steps.isNotEmpty ? steps.last : null;

  List<SequenceStep> get focusSteps => steps.where((step) => step.isFocusStep).toList();
  List<SequenceStep> get breakSteps => steps.where((step) => step.isBreakStep).toList();

  int get totalFocusMinutes => focusSteps.fold(0, (total, step) => total + step.durationMinutes);
  int get totalBreakMinutes => breakSteps.fold(0, (total, step) => total + step.durationMinutes);

  double get focusToBreakRatio {
    if (totalBreakMinutes == 0) return double.infinity;
    return totalFocusMinutes / totalBreakMinutes;
  }

  SequenceCategory get category {
    if (steps.isEmpty) return SequenceCategory.custom;

    final profileTypes = steps.map((step) => step.profileType).toSet();

    if (profileTypes.contains(ProfileType.work) && profileTypes.length == 1) {
      return SequenceCategory.work;
    } else if (profileTypes.contains(ProfileType.study) && profileTypes.length == 1) {
      return SequenceCategory.study;
    } else if (profileTypes.contains(ProfileType.exercise) && profileTypes.length == 1) {
      return SequenceCategory.exercise;
    } else if (profileTypes.contains(ProfileType.meditation) && profileTypes.length == 1) {
      return SequenceCategory.meditation;
    } else {
      return SequenceCategory.mixed;
    }
  }

  bool get isWorkSequence => category == SequenceCategory.work;
  bool get isStudySequence => category == SequenceCategory.study;
  bool get isExerciseSequence => category == SequenceCategory.exercise;
  bool get isMeditationSequence => category == SequenceCategory.meditation;
  bool get isMixedSequence => category == SequenceCategory.mixed;

  @override
  List<Object?> get props => [
        id,
        name,
        description,
        totalDurationMinutes,
        autoTransition,
        steps,
        createdAt,
        updatedAt,
      ];
}

@JsonSerializable()
class SequenceStep extends Equatable {
  final String id;
  final String sequenceId;
  final String profileId;
  final int stepOrder;
  final Profile? profile; // Populated when loaded with profile data

  const SequenceStep({
    required this.id,
    required this.sequenceId,
    required this.profileId,
    required this.stepOrder,
    this.profile,
  });

  factory SequenceStep.fromJson(Map<String, dynamic> json) => _$SequenceStepFromJson(json);
  Map<String, dynamic> toJson() => _$SequenceStepToJson(this);

  factory SequenceStep.fromDatabase(Map<String, dynamic> map, {Profile? profile}) {
    return SequenceStep(
      id: map['id'] as String,
      sequenceId: map['sequence_id'] as String,
      profileId: map['profile_id'] as String,
      stepOrder: map['step_order'] as int,
      profile: profile,
    );
  }

  Map<String, dynamic> toDatabase() {
    return {
      'id': id,
      'sequence_id': sequenceId,
      'profile_id': profileId,
      'step_order': stepOrder,
    };
  }

  SequenceStep copyWith({
    String? id,
    String? sequenceId,
    String? profileId,
    int? stepOrder,
    Profile? profile,
  }) {
    return SequenceStep(
      id: id ?? this.id,
      sequenceId: sequenceId ?? this.sequenceId,
      profileId: profileId ?? this.profileId,
      stepOrder: stepOrder ?? this.stepOrder,
      profile: profile ?? this.profile,
    );
  }

  String get name => profile?.name ?? 'Unknown Profile';
  String? get description => profile?.description;
  int get durationMinutes => profile?.durationMinutes ?? 0;
  Duration get duration => Duration(minutes: durationMinutes);

  ProfileType get profileType => profile?.themeConfig?.profileType ?? ProfileType.custom;

  bool get isFocusStep => profileType == ProfileType.work ||
      profileType == ProfileType.study ||
      profileType == ProfileType.exercise ||
      profileType == ProfileType.meditation;

  bool get isBreakStep => profileType == ProfileType.breakTime;

  bool get hasBreaks => profile?.hasBreaks ?? false;
  bool get hasAiCoaching => profile?.aiCoachingEnabled ?? false;
  bool get hasBlocking => profile?.blockingConfig?.enabled ?? false;

  String get stepTypeLabel {
    switch (profileType) {
      case ProfileType.work:
        return 'Work Focus';
      case ProfileType.study:
        return 'Study Session';
      case ProfileType.exercise:
        return 'Exercise';
      case ProfileType.meditation:
        return 'Meditation';
      case ProfileType.breakTime:
        return 'Break';
      case ProfileType.custom:
        return 'Custom';
    }
  }

  @override
  List<Object?> get props => [id, sequenceId, profileId, stepOrder, profile];
}

@JsonSerializable()
class SequenceProgress extends Equatable {
  final String sequenceId;
  final int currentStepIndex;
  final int totalSteps;
  final DateTime startedAt;
  final DateTime? pausedAt;
  final Duration elapsedTime;
  final Duration remainingTime;
  final SequenceProgressStatus status;
  final List<StepProgress> stepProgress;

  const SequenceProgress({
    required this.sequenceId,
    required this.currentStepIndex,
    required this.totalSteps,
    required this.startedAt,
    this.pausedAt,
    this.elapsedTime = Duration.zero,
    this.remainingTime = Duration.zero,
    this.status = SequenceProgressStatus.notStarted,
    this.stepProgress = const [],
  });

  factory SequenceProgress.fromJson(Map<String, dynamic> json) => _$SequenceProgressFromJson(json);
  Map<String, dynamic> toJson() => _$SequenceProgressToJson(this);

  SequenceProgress copyWith({
    String? sequenceId,
    int? currentStepIndex,
    int? totalSteps,
    DateTime? startedAt,
    DateTime? pausedAt,
    Duration? elapsedTime,
    Duration? remainingTime,
    SequenceProgressStatus? status,
    List<StepProgress>? stepProgress,
  }) {
    return SequenceProgress(
      sequenceId: sequenceId ?? this.sequenceId,
      currentStepIndex: currentStepIndex ?? this.currentStepIndex,
      totalSteps: totalSteps ?? this.totalSteps,
      startedAt: startedAt ?? this.startedAt,
      pausedAt: pausedAt ?? this.pausedAt,
      elapsedTime: elapsedTime ?? this.elapsedTime,
      remainingTime: remainingTime ?? this.remainingTime,
      status: status ?? this.status,
      stepProgress: stepProgress ?? this.stepProgress,
    );
  }

  double get overallProgress => totalSteps > 0 ? currentStepIndex / totalSteps : 0.0;
  bool get isCompleted => status == SequenceProgressStatus.completed;
  bool get isInProgress => status == SequenceProgressStatus.inProgress;
  bool get isPaused => status == SequenceProgressStatus.paused;
  bool get isStopped => status == SequenceProgressStatus.stopped;
  bool get isNotStarted => status == SequenceProgressStatus.notStarted;

  int get completedSteps => stepProgress.where((step) => step.isCompleted).length;
  int get remainingSteps => totalSteps - currentStepIndex;

  bool get isFirstStep => currentStepIndex == 0;
  bool get isLastStep => currentStepIndex == totalSteps - 1;

  StepProgress? get currentStepProgress {
    if (currentStepIndex < 0 || currentStepIndex >= stepProgress.length) return null;
    return stepProgress[currentStepIndex];
  }

  @override
  List<Object?> get props => [
        sequenceId,
        currentStepIndex,
        totalSteps,
        startedAt,
        pausedAt,
        elapsedTime,
        remainingTime,
        status,
        stepProgress,
      ];
}

@JsonSerializable()
class StepProgress extends Equatable {
  final String stepId;
  final int stepIndex;
  final DateTime? startedAt;
  final DateTime? completedAt;
  final Duration plannedDuration;
  final Duration elapsedDuration;
  final StepProgressStatus status;

  const StepProgress({
    required this.stepId,
    required this.stepIndex,
    this.startedAt,
    this.completedAt,
    this.plannedDuration = Duration.zero,
    this.elapsedDuration = Duration.zero,
    this.status = StepProgressStatus.notStarted,
  });

  factory StepProgress.fromJson(Map<String, dynamic> json) => _$StepProgressFromJson(json);
  Map<String, dynamic> toJson() => _$StepProgressToJson(this);

  StepProgress copyWith({
    String? stepId,
    int? stepIndex,
    DateTime? startedAt,
    DateTime? completedAt,
    Duration? plannedDuration,
    Duration? elapsedDuration,
    StepProgressStatus? status,
  }) {
    return StepProgress(
      stepId: stepId ?? this.stepId,
      stepIndex: stepIndex ?? this.stepIndex,
      startedAt: startedAt ?? this.startedAt,
      completedAt: completedAt ?? this.completedAt,
      plannedDuration: plannedDuration ?? this.plannedDuration,
      elapsedDuration: elapsedDuration ?? this.elapsedDuration,
      status: status ?? this.status,
    );
  }

  double get progress {
    if (plannedDuration == Duration.zero) return 0.0;
    return (elapsedDuration.inMilliseconds / plannedDuration.inMilliseconds).clamp(0.0, 1.0);
  }

  Duration get remainingDuration => plannedDuration - elapsedDuration;

  bool get isCompleted => status == StepProgressStatus.completed;
  bool get isInProgress => status == StepProgressStatus.inProgress;
  bool get isPaused => status == StepProgressStatus.paused;
  bool get isStopped => status == StepProgressStatus.stopped;
  bool get isNotStarted => status == StepProgressStatus.notStarted;

  @override
  List<Object?> get props => [
        stepId,
        stepIndex,
        startedAt,
        completedAt,
        plannedDuration,
        elapsedDuration,
        status,
      ];
}

enum SequenceCategory {
  work,
  study,
  exercise,
  meditation,
  mixed,
  custom,
}

enum SequenceProgressStatus {
  @JsonValue('not_started')
  notStarted,
  @JsonValue('in_progress')
  inProgress,
  @JsonValue('paused')
  paused,
  @JsonValue('completed')
  completed,
  @JsonValue('stopped')
  stopped,
}

enum StepProgressStatus {
  @JsonValue('not_started')
  notStarted,
  @JsonValue('in_progress')
  inProgress,
  @JsonValue('paused')
  paused,
  @JsonValue('completed')
  completed,
  @JsonValue('stopped')
  stopped,
}

extension SequenceCategoryExtension on SequenceCategory {
  String get displayName {
    switch (this) {
      case SequenceCategory.work:
        return 'Work Sequences';
      case SequenceCategory.study:
        return 'Study Sequences';
      case SequenceCategory.exercise:
        return 'Exercise Sequences';
      case SequenceCategory.meditation:
        return 'Meditation Sequences';
      case SequenceCategory.mixed:
        return 'Mixed Sequences';
      case SequenceCategory.custom:
        return 'Custom Sequences';
    }
  }

  String get description {
    switch (this) {
      case SequenceCategory.work:
        return 'Productivity-focused work routines';
      case SequenceCategory.study:
        return 'Learning and concentration routines';
      case SequenceCategory.exercise:
        return 'Fitness and workout routines';
      case SequenceCategory.meditation:
        return 'Mindfulness and relaxation routines';
      case SequenceCategory.mixed:
        return 'Multi-activity routines';
      case SequenceCategory.custom:
        return 'Personalized routines';
    }
  }

  String get emoji {
    switch (this) {
      case SequenceCategory.work:
        return '💼';
      case SequenceCategory.study:
        return '📚';
      case SequenceCategory.exercise:
        return '💪';
      case SequenceCategory.meditation:
        return '🧘';
      case SequenceCategory.mixed:
        return '🔄';
      case SequenceCategory.custom:
        return '⚙️';
    }
  }
}