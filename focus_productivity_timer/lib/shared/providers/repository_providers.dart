// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/focus_productivity_timer/lib/shared/providers/repository_providers.dart
// Description: Repository providers for dependency injection and data access layer
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-26

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/repositories/profile_repository.dart';
import '../../core/repositories/session_repository.dart';
import '../../core/repositories/sequence_repository.dart';
import 'database_provider.dart';

/// Profile repository provider
final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  final databaseHelper = ref.watch(databaseHelperProvider);
  return ProfileRepository(databaseHelper);
});

/// Session repository provider
final sessionRepositoryProvider = Provider<SessionRepository>((ref) {
  final databaseHelper = ref.watch(databaseHelperProvider);
  return SessionRepository(databaseHelper);
});

/// Sequence repository provider
final sequenceRepositoryProvider = Provider<SequenceRepository>((ref) {
  final databaseHelper = ref.watch(databaseHelperProvider);
  final profileRepository = ref.watch(profileRepositoryProvider);
  return SequenceRepository(databaseHelper, profileRepository);
});

/// Provider for all profiles
final allProfilesProvider = FutureProvider<List<Profile>>((ref) async {
  final repository = ref.watch(profileRepositoryProvider);
  return await repository.getAllProfiles();
});

/// Provider for all sequences
final allSequencesProvider = FutureProvider<List<Sequence>>((ref) async {
  final repository = ref.watch(sequenceRepositoryProvider);
  return await repository.getAllSequences();
});

/// Provider for session statistics
final sessionStatisticsProvider = FutureProvider<SessionStatistics>((ref) async {
  final repository = ref.watch(sessionRepositoryProvider);
  return await repository.getSessionStatistics();
});

/// Provider for most used profiles
final mostUsedProfilesProvider = FutureProvider<List<Profile>>((ref) async {
  final repository = ref.watch(profileRepositoryProvider);
  return await repository.getMostUsedProfiles(limit: 5);
});

/// Provider for most used sequences
final mostUsedSequencesProvider = FutureProvider<List<Sequence>>((ref) async {
  final repository = ref.watch(sequenceRepositoryProvider);
  return await repository.getMostUsedSequences(limit: 5);
});

/// Provider for today's sessions
final todaySessionsProvider = FutureProvider<List<Session>>((ref) async {
  final repository = ref.watch(sessionRepositoryProvider);
  return await repository.getTodaySessions();
});

/// Provider for active session
final activeSessionProvider = FutureProvider<Session?>((ref) async {
  final repository = ref.watch(sessionRepositoryProvider);
  return await repository.getActiveSession();
});

/// Provider for profile by ID
final profileByIdProvider = FutureProvider.family<Profile?, String>((ref, profileId) async {
  final repository = ref.watch(profileRepositoryProvider);
  return await repository.getProfileById(profileId);
});

/// Provider for sequence by ID
final sequenceByIdProvider = FutureProvider.family<Sequence?, String>((ref, sequenceId) async {
  final repository = ref.watch(sequenceRepositoryProvider);
  return await repository.getSequenceById(sequenceId);
});

/// Provider for sessions by profile
final sessionsByProfileProvider = FutureProvider.family<List<Session>, String>((ref, profileId) async {
  final repository = ref.watch(sessionRepositoryProvider);
  return await repository.getSessionsByProfile(profileId);
});

/// Provider for sequences by category
final sequencesByCategoryProvider = FutureProvider.family<List<Sequence>, SequenceCategory>((ref, category) async {
  final repository = ref.watch(sequenceRepositoryProvider);
  return await repository.getSequencesByCategory(category);
});

/// Provider for profile search
final profileSearchProvider = FutureProvider.family<List<Profile>, String>((ref, query) async {
  final repository = ref.watch(profileRepositoryProvider);
  return await repository.searchProfiles(query);
});

/// Provider for sequence search
final sequenceSearchProvider = FutureProvider.family<List<Sequence>, String>((ref, query) async {
  final repository = ref.watch(sequenceRepositoryProvider);
  return await repository.searchSequences(query);
});

/// Provider for profile usage statistics
final profileUsageStatsProvider = FutureProvider<Map<String, int>>((ref) async {
  final repository = ref.watch(profileRepositoryProvider);
  return await repository.getProfileUsageStats();
});

/// Provider for sequence statistics
final sequenceStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final repository = ref.watch(sequenceRepositoryProvider);
  return await repository.getSequenceStatistics();
});

/// Provider for session quality distribution
final sessionQualityDistributionProvider = FutureProvider<Map<SessionQuality, int>>((ref) async {
  final repository = ref.watch(sessionRepositoryProvider);
  return await repository.getSessionQualityDistribution();
});

/// Provider for daily session counts
final dailySessionCountsProvider = FutureProvider.family<Map<DateTime, int>, int>((ref, days) async {
  final repository = ref.watch(sessionRepositoryProvider);
  return await repository.getDailySessionCounts(days);
});

/// Import necessary models
import '../../shared/models/profile_model.dart';
import '../../shared/models/session_model.dart';
import '../../shared/models/sequence_model.dart';