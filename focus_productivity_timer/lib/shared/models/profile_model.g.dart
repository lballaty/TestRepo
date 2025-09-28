// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'profile_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Profile _$ProfileFromJson(Map<String, dynamic> json) => Profile(
  id: json['id'] as String,
  name: json['name'] as String,
  description: json['description'] as String?,
  durationMinutes: (json['durationMinutes'] as num).toInt(),
  breakDurationMinutes: (json['breakDurationMinutes'] as num?)?.toInt() ?? 5,
  longBreakDurationMinutes:
      (json['longBreakDurationMinutes'] as num?)?.toInt() ?? 15,
  breakFrequency: (json['breakFrequency'] as num?)?.toInt() ?? 4,
  notificationSoundPath: json['notificationSoundPath'] as String?,
  themeConfig:
      json['themeConfig'] == null
          ? null
          : ThemeConfiguration.fromJson(
            json['themeConfig'] as Map<String, dynamic>,
          ),
  blockingConfig:
      json['blockingConfig'] == null
          ? null
          : BlockingConfiguration.fromJson(
            json['blockingConfig'] as Map<String, dynamic>,
          ),
  aiCoachingEnabled: json['aiCoachingEnabled'] as bool? ?? true,
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$ProfileToJson(Profile instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'description': instance.description,
  'durationMinutes': instance.durationMinutes,
  'breakDurationMinutes': instance.breakDurationMinutes,
  'longBreakDurationMinutes': instance.longBreakDurationMinutes,
  'breakFrequency': instance.breakFrequency,
  'notificationSoundPath': instance.notificationSoundPath,
  'themeConfig': instance.themeConfig,
  'blockingConfig': instance.blockingConfig,
  'aiCoachingEnabled': instance.aiCoachingEnabled,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
};

ThemeConfiguration _$ThemeConfigurationFromJson(Map<String, dynamic> json) =>
    ThemeConfiguration(
      color: json['color'] as String,
      profileType: $enumDecode(_$ProfileTypeEnumMap, json['profileType']),
      backgroundImage: json['backgroundImage'] as String?,
      opacity: (json['opacity'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$ThemeConfigurationToJson(ThemeConfiguration instance) =>
    <String, dynamic>{
      'color': instance.color,
      'profileType': _$ProfileTypeEnumMap[instance.profileType]!,
      'backgroundImage': instance.backgroundImage,
      'opacity': instance.opacity,
    };

const _$ProfileTypeEnumMap = {
  ProfileType.work: 'work',
  ProfileType.study: 'study',
  ProfileType.exercise: 'exercise',
  ProfileType.meditation: 'meditation',
  ProfileType.breakTime: 'break',
  ProfileType.custom: 'custom',
};

BlockingConfiguration _$BlockingConfigurationFromJson(
  Map<String, dynamic> json,
) => BlockingConfiguration(
  enabled: json['enabled'] as bool,
  websites:
      (json['websites'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const [],
  applications:
      (json['applications'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList() ??
      const [],
  level:
      $enumDecodeNullable(_$BlockingLevelEnumMap, json['level']) ??
      BlockingLevel.moderate,
);

Map<String, dynamic> _$BlockingConfigurationToJson(
  BlockingConfiguration instance,
) => <String, dynamic>{
  'enabled': instance.enabled,
  'websites': instance.websites,
  'applications': instance.applications,
  'level': _$BlockingLevelEnumMap[instance.level]!,
};

const _$BlockingLevelEnumMap = {
  BlockingLevel.none: 'none',
  BlockingLevel.light: 'light',
  BlockingLevel.moderate: 'moderate',
  BlockingLevel.strict: 'strict',
};
