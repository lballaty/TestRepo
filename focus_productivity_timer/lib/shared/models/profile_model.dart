// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/focus_productivity_timer/lib/shared/models/profile_model.dart
// Description: Profile data model for timer profiles and configurations
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-26

import 'dart:convert';
import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'profile_model.g.dart';

@JsonSerializable()
class Profile extends Equatable {
  final String id;
  final String name;
  final String? description;
  final int durationMinutes;
  final int breakDurationMinutes;
  final int longBreakDurationMinutes;
  final int breakFrequency;
  final String? notificationSoundPath;
  final ThemeConfiguration? themeConfig;
  final BlockingConfiguration? blockingConfig;
  final bool aiCoachingEnabled;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Profile({
    required this.id,
    required this.name,
    this.description,
    required this.durationMinutes,
    this.breakDurationMinutes = 5,
    this.longBreakDurationMinutes = 15,
    this.breakFrequency = 4,
    this.notificationSoundPath,
    this.themeConfig,
    this.blockingConfig,
    this.aiCoachingEnabled = true,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Profile.fromJson(Map<String, dynamic> json) => _$ProfileFromJson(json);

  Map<String, dynamic> toJson() => _$ProfileToJson(this);

  factory Profile.fromDatabase(Map<String, dynamic> map) {
    return Profile(
      id: map['id'] as String,
      name: map['name'] as String,
      description: map['description'] as String?,
      durationMinutes: map['duration_minutes'] as int,
      breakDurationMinutes: map['break_duration_minutes'] as int? ?? 5,
      longBreakDurationMinutes: map['long_break_duration_minutes'] as int? ?? 15,
      breakFrequency: map['break_frequency'] as int? ?? 4,
      notificationSoundPath: map['notification_sound_path'] as String?,
      themeConfig: map['theme_config'] != null
          ? ThemeConfiguration.fromJson(jsonDecode(map['theme_config'] as String))
          : null,
      blockingConfig: map['blocking_config'] != null
          ? BlockingConfiguration.fromJson(jsonDecode(map['blocking_config'] as String))
          : null,
      aiCoachingEnabled: (map['ai_coaching_enabled'] as int? ?? 1) == 1,
      createdAt: DateTime.fromMillisecondsSinceEpoch(map['created_at'] as int),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(map['updated_at'] as int),
    );
  }

  Map<String, dynamic> toDatabase() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'duration_minutes': durationMinutes,
      'break_duration_minutes': breakDurationMinutes,
      'long_break_duration_minutes': longBreakDurationMinutes,
      'break_frequency': breakFrequency,
      'notification_sound_path': notificationSoundPath,
      'theme_config': themeConfig != null ? jsonEncode(themeConfig!.toJson()) : null,
      'blocking_config': blockingConfig != null ? jsonEncode(blockingConfig!.toJson()) : null,
      'ai_coaching_enabled': aiCoachingEnabled ? 1 : 0,
      'created_at': createdAt.millisecondsSinceEpoch,
      'updated_at': updatedAt.millisecondsSinceEpoch,
    };
  }

  Profile copyWith({
    String? id,
    String? name,
    String? description,
    int? durationMinutes,
    int? breakDurationMinutes,
    int? longBreakDurationMinutes,
    int? breakFrequency,
    String? notificationSoundPath,
    ThemeConfiguration? themeConfig,
    BlockingConfiguration? blockingConfig,
    bool? aiCoachingEnabled,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Profile(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      durationMinutes: durationMinutes ?? this.durationMinutes,
      breakDurationMinutes: breakDurationMinutes ?? this.breakDurationMinutes,
      longBreakDurationMinutes: longBreakDurationMinutes ?? this.longBreakDurationMinutes,
      breakFrequency: breakFrequency ?? this.breakFrequency,
      notificationSoundPath: notificationSoundPath ?? this.notificationSoundPath,
      themeConfig: themeConfig ?? this.themeConfig,
      blockingConfig: blockingConfig ?? this.blockingConfig,
      aiCoachingEnabled: aiCoachingEnabled ?? this.aiCoachingEnabled,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Duration get duration => Duration(minutes: durationMinutes);
  Duration get breakDuration => Duration(minutes: breakDurationMinutes);
  Duration get longBreakDuration => Duration(minutes: longBreakDurationMinutes);

  bool get hasBreaks => breakDurationMinutes > 0 || longBreakDurationMinutes > 0;
  bool get isWorkProfile => themeConfig?.profileType == ProfileType.work;
  bool get isStudyProfile => themeConfig?.profileType == ProfileType.study;
  bool get isExerciseProfile => themeConfig?.profileType == ProfileType.exercise;
  bool get isMeditationProfile => themeConfig?.profileType == ProfileType.meditation;

  @override
  List<Object?> get props => [
        id,
        name,
        description,
        durationMinutes,
        breakDurationMinutes,
        longBreakDurationMinutes,
        breakFrequency,
        notificationSoundPath,
        themeConfig,
        blockingConfig,
        aiCoachingEnabled,
        createdAt,
        updatedAt,
      ];
}

@JsonSerializable()
class ThemeConfiguration extends Equatable {
  final String color;
  final ProfileType profileType;
  final String? backgroundImage;
  final double? opacity;

  const ThemeConfiguration({
    required this.color,
    required this.profileType,
    this.backgroundImage,
    this.opacity,
  });

  factory ThemeConfiguration.fromJson(Map<String, dynamic> json) => _$ThemeConfigurationFromJson(json);
  Map<String, dynamic> toJson() => _$ThemeConfigurationToJson(this);

  @override
  List<Object?> get props => [color, profileType, backgroundImage, opacity];
}

@JsonSerializable()
class BlockingConfiguration extends Equatable {
  final bool enabled;
  final List<String> websites;
  final List<String> applications;
  final BlockingLevel level;

  const BlockingConfiguration({
    required this.enabled,
    this.websites = const [],
    this.applications = const [],
    this.level = BlockingLevel.moderate,
  });

  factory BlockingConfiguration.fromJson(Map<String, dynamic> json) => _$BlockingConfigurationFromJson(json);
  Map<String, dynamic> toJson() => _$BlockingConfigurationToJson(this);

  @override
  List<Object?> get props => [enabled, websites, applications, level];
}

enum ProfileType {
  @JsonValue('work')
  work,
  @JsonValue('study')
  study,
  @JsonValue('exercise')
  exercise,
  @JsonValue('meditation')
  meditation,
  @JsonValue('break')
  breakTime,
  @JsonValue('custom')
  custom,
}

enum BlockingLevel {
  @JsonValue('none')
  none,
  @JsonValue('light')
  light,
  @JsonValue('moderate')
  moderate,
  @JsonValue('strict')
  strict,
}

extension ProfileTypeExtension on ProfileType {
  String get displayName {
    switch (this) {
      case ProfileType.work:
        return 'Work Focus';
      case ProfileType.study:
        return 'Study Session';
      case ProfileType.exercise:
        return 'Exercise';
      case ProfileType.meditation:
        return 'Meditation';
      case ProfileType.breakTime:
        return 'Break Time';
      case ProfileType.custom:
        return 'Custom';
    }
  }

  String get description {
    switch (this) {
      case ProfileType.work:
        return 'Focused work sessions with productivity tracking';
      case ProfileType.study:
        return 'Deep learning sessions with concentration support';
      case ProfileType.exercise:
        return 'Workout timers and fitness tracking';
      case ProfileType.meditation:
        return 'Mindfulness and relaxation sessions';
      case ProfileType.breakTime:
        return 'Rest and recovery periods';
      case ProfileType.custom:
        return 'Personalized timer configuration';
    }
  }

  String get defaultColor {
    switch (this) {
      case ProfileType.work:
        return '#2196F3'; // Blue
      case ProfileType.study:
        return '#4CAF50'; // Green
      case ProfileType.exercise:
        return '#FF5722'; // Deep Orange
      case ProfileType.meditation:
        return '#9C27B0'; // Purple
      case ProfileType.breakTime:
        return '#FFC107'; // Amber
      case ProfileType.custom:
        return '#607D8B'; // Blue Grey
    }
  }
}

extension BlockingLevelExtension on BlockingLevel {
  String get displayName {
    switch (this) {
      case BlockingLevel.none:
        return 'No Blocking';
      case BlockingLevel.light:
        return 'Light Blocking';
      case BlockingLevel.moderate:
        return 'Moderate Blocking';
      case BlockingLevel.strict:
        return 'Strict Blocking';
    }
  }

  String get description {
    switch (this) {
      case BlockingLevel.none:
        return 'No websites or apps are blocked';
      case BlockingLevel.light:
        return 'Block major social media and entertainment sites';
      case BlockingLevel.moderate:
        return 'Block social media, news, and entertainment sites';
      case BlockingLevel.strict:
        return 'Block all non-essential websites and applications';
    }
  }
}