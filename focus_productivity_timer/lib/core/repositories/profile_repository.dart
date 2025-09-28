// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/focus_productivity_timer/lib/core/repositories/profile_repository.dart
// Description: Repository for Profile CRUD operations and data access
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-26

import 'package:sqflite/sqflite.dart';
import 'package:logger/logger.dart';
import '../../shared/models/profile_model.dart';
import '../database/database_helper.dart';

class ProfileRepository {
  final DatabaseHelper _databaseHelper;
  final Logger _logger = Logger();

  ProfileRepository(this._databaseHelper);

  /// Create a new profile
  Future<Profile> createProfile(Profile profile) async {
    try {
      final db = await _databaseHelper.database;

      await db.insert(
        'profiles',
        profile.toDatabase(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );

      _logger.i('Created profile: ${profile.name} (${profile.id})');
      return profile;
    } catch (e) {
      _logger.e('Error creating profile: $e');
      rethrow;
    }
  }

  /// Get a profile by ID
  Future<Profile?> getProfileById(String id) async {
    try {
      final db = await _databaseHelper.database;

      final List<Map<String, dynamic>> maps = await db.query(
        'profiles',
        where: 'id = ?',
        whereArgs: [id],
        limit: 1,
      );

      if (maps.isEmpty) {
        _logger.w('Profile not found: $id');
        return null;
      }

      final profile = Profile.fromDatabase(maps.first);
      _logger.d('Retrieved profile: ${profile.name}');
      return profile;
    } catch (e) {
      _logger.e('Error getting profile by ID: $e');
      rethrow;
    }
  }

  /// Get all profiles
  Future<List<Profile>> getAllProfiles() async {
    try {
      final db = await _databaseHelper.database;

      final List<Map<String, dynamic>> maps = await db.query(
        'profiles',
        orderBy: 'created_at DESC',
      );

      final profiles = maps.map((map) => Profile.fromDatabase(map)).toList();
      _logger.d('Retrieved ${profiles.length} profiles');
      return profiles;
    } catch (e) {
      _logger.e('Error getting all profiles: $e');
      rethrow;
    }
  }

  /// Get profiles by type
  Future<List<Profile>> getProfilesByType(ProfileType type) async {
    try {
      final db = await _databaseHelper.database;

      final List<Map<String, dynamic>> maps = await db.query(
        'profiles',
        where: 'theme_config LIKE ?',
        whereArgs: ['%"profileType":"${type.name}"%'],
        orderBy: 'created_at DESC',
      );

      final profiles = maps.map((map) => Profile.fromDatabase(map)).toList();
      _logger.d('Retrieved ${profiles.length} profiles of type: ${type.name}');
      return profiles;
    } catch (e) {
      _logger.e('Error getting profiles by type: $e');
      rethrow;
    }
  }

  /// Search profiles by name or description
  Future<List<Profile>> searchProfiles(String query) async {
    try {
      final db = await _databaseHelper.database;

      final List<Map<String, dynamic>> maps = await db.query(
        'profiles',
        where: 'name LIKE ? OR description LIKE ?',
        whereArgs: ['%$query%', '%$query%'],
        orderBy: 'created_at DESC',
      );

      final profiles = maps.map((map) => Profile.fromDatabase(map)).toList();
      _logger.d('Found ${profiles.length} profiles matching: $query');
      return profiles;
    } catch (e) {
      _logger.e('Error searching profiles: $e');
      rethrow;
    }
  }

  /// Update an existing profile
  Future<Profile> updateProfile(Profile profile) async {
    try {
      final db = await _databaseHelper.database;

      final updatedProfile = profile.copyWith(
        updatedAt: DateTime.now(),
      );

      final rowsAffected = await db.update(
        'profiles',
        updatedProfile.toDatabase(),
        where: 'id = ?',
        whereArgs: [profile.id],
      );

      if (rowsAffected == 0) {
        throw Exception('Profile not found: ${profile.id}');
      }

      _logger.i('Updated profile: ${profile.name} (${profile.id})');
      return updatedProfile;
    } catch (e) {
      _logger.e('Error updating profile: $e');
      rethrow;
    }
  }

  /// Delete a profile
  Future<void> deleteProfile(String id) async {
    try {
      final db = await _databaseHelper.database;

      // Check if profile exists
      final profile = await getProfileById(id);
      if (profile == null) {
        throw Exception('Profile not found: $id');
      }

      // Check if profile is used in any sequences
      final sequenceUsage = await _checkProfileUsageInSequences(id);
      if (sequenceUsage > 0) {
        throw Exception('Cannot delete profile: Used in $sequenceUsage sequence(s)');
      }

      // Check if profile is used in any active sessions
      final sessionUsage = await _checkProfileUsageInSessions(id);
      if (sessionUsage > 0) {
        throw Exception('Cannot delete profile: Has $sessionUsage session(s)');
      }

      final rowsAffected = await db.delete(
        'profiles',
        where: 'id = ?',
        whereArgs: [id],
      );

      if (rowsAffected == 0) {
        throw Exception('Failed to delete profile: $id');
      }

      _logger.i('Deleted profile: ${profile.name} ($id)');
    } catch (e) {
      _logger.e('Error deleting profile: $e');
      rethrow;
    }
  }

  /// Get profiles created in the last N days
  Future<List<Profile>> getRecentProfiles(int days) async {
    try {
      final db = await _databaseHelper.database;
      final cutoffDate = DateTime.now().subtract(Duration(days: days));

      final List<Map<String, dynamic>> maps = await db.query(
        'profiles',
        where: 'created_at >= ?',
        whereArgs: [cutoffDate.millisecondsSinceEpoch],
        orderBy: 'created_at DESC',
      );

      final profiles = maps.map((map) => Profile.fromDatabase(map)).toList();
      _logger.d('Retrieved ${profiles.length} recent profiles (last $days days)');
      return profiles;
    } catch (e) {
      _logger.e('Error getting recent profiles: $e');
      rethrow;
    }
  }

  /// Get the most frequently used profiles
  Future<List<Profile>> getMostUsedProfiles({int limit = 10}) async {
    try {
      final db = await _databaseHelper.database;

      final List<Map<String, dynamic>> maps = await db.rawQuery('''
        SELECT p.*, COUNT(s.id) as usage_count
        FROM profiles p
        LEFT JOIN sessions s ON p.id = s.profile_id
        GROUP BY p.id
        ORDER BY usage_count DESC, p.created_at DESC
        LIMIT ?
      ''', [limit]);

      final profiles = maps.map((map) => Profile.fromDatabase(map)).toList();
      _logger.d('Retrieved ${profiles.length} most used profiles');
      return profiles;
    } catch (e) {
      _logger.e('Error getting most used profiles: $e');
      rethrow;
    }
  }

  /// Get profile usage statistics
  Future<Map<String, int>> getProfileUsageStats() async {
    try {
      final db = await _databaseHelper.database;

      final List<Map<String, dynamic>> result = await db.rawQuery('''
        SELECT p.name, COUNT(s.id) as usage_count
        FROM profiles p
        LEFT JOIN sessions s ON p.id = s.profile_id
        GROUP BY p.id, p.name
        ORDER BY usage_count DESC
      ''');

      final stats = <String, int>{};
      for (final row in result) {
        stats[row['name'] as String] = row['usage_count'] as int;
      }

      _logger.d('Retrieved usage stats for ${stats.length} profiles');
      return stats;
    } catch (e) {
      _logger.e('Error getting profile usage stats: $e');
      rethrow;
    }
  }

  /// Duplicate a profile with a new name
  Future<Profile> duplicateProfile(String profileId, String newName) async {
    try {
      final originalProfile = await getProfileById(profileId);
      if (originalProfile == null) {
        throw Exception('Profile not found: $profileId');
      }

      // Generate new ID and timestamp
      final now = DateTime.now();
      final newId = 'profile_${now.millisecondsSinceEpoch}';

      final duplicatedProfile = originalProfile.copyWith(
        id: newId,
        name: newName,
        createdAt: now,
        updatedAt: now,
      );

      return await createProfile(duplicatedProfile);
    } catch (e) {
      _logger.e('Error duplicating profile: $e');
      rethrow;
    }
  }

  /// Check if a profile name already exists
  Future<bool> profileNameExists(String name, {String? excludeId}) async {
    try {
      final db = await _databaseHelper.database;

      String whereClause = 'LOWER(name) = LOWER(?)';
      List<dynamic> whereArgs = [name];

      if (excludeId != null) {
        whereClause += ' AND id != ?';
        whereArgs.add(excludeId);
      }

      final List<Map<String, dynamic>> maps = await db.query(
        'profiles',
        where: whereClause,
        whereArgs: whereArgs,
        limit: 1,
      );

      return maps.isNotEmpty;
    } catch (e) {
      _logger.e('Error checking profile name existence: $e');
      rethrow;
    }
  }

  /// Get total count of profiles
  Future<int> getProfileCount() async {
    try {
      final db = await _databaseHelper.database;

      final result = await db.rawQuery('SELECT COUNT(*) as count FROM profiles');
      final count = result.first['count'] as int;

      _logger.d('Total profile count: $count');
      return count;
    } catch (e) {
      _logger.e('Error getting profile count: $e');
      rethrow;
    }
  }

  /// Bulk insert profiles (for import operations)
  Future<void> bulkInsertProfiles(List<Profile> profiles) async {
    try {
      final db = await _databaseHelper.database;

      await db.transaction((txn) async {
        for (final profile in profiles) {
          await txn.insert(
            'profiles',
            profile.toDatabase(),
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        }
      });

      _logger.i('Bulk inserted ${profiles.length} profiles');
    } catch (e) {
      _logger.e('Error bulk inserting profiles: $e');
      rethrow;
    }
  }

  /// Private helper to check profile usage in sequences
  Future<int> _checkProfileUsageInSequences(String profileId) async {
    try {
      final db = await _databaseHelper.database;

      final result = await db.rawQuery(
        'SELECT COUNT(*) as count FROM sequence_steps WHERE profile_id = ?',
        [profileId],
      );

      return result.first['count'] as int;
    } catch (e) {
      _logger.e('Error checking profile usage in sequences: $e');
      return 0;
    }
  }

  /// Private helper to check profile usage in sessions
  Future<int> _checkProfileUsageInSessions(String profileId) async {
    try {
      final db = await _databaseHelper.database;

      final result = await db.rawQuery(
        'SELECT COUNT(*) as count FROM sessions WHERE profile_id = ?',
        [profileId],
      );

      return result.first['count'] as int;
    } catch (e) {
      _logger.e('Error checking profile usage in sessions: $e');
      return 0;
    }
  }

  /// Export profile data as JSON
  Future<Map<String, dynamic>> exportProfile(String profileId) async {
    try {
      final profile = await getProfileById(profileId);
      if (profile == null) {
        throw Exception('Profile not found: $profileId');
      }

      final exportData = {
        'profile': profile.toJson(),
        'exported_at': DateTime.now().toIso8601String(),
        'version': '1.0',
      };

      _logger.i('Exported profile: ${profile.name}');
      return exportData;
    } catch (e) {
      _logger.e('Error exporting profile: $e');
      rethrow;
    }
  }

  /// Import profile from JSON data
  Future<Profile> importProfile(Map<String, dynamic> importData) async {
    try {
      if (!importData.containsKey('profile')) {
        throw Exception('Invalid import data: missing profile');
      }

      final profileData = importData['profile'] as Map<String, dynamic>;
      var profile = Profile.fromJson(profileData);

      // Generate new ID and timestamps to avoid conflicts
      final now = DateTime.now();
      final newId = 'profile_${now.millisecondsSinceEpoch}';

      profile = profile.copyWith(
        id: newId,
        createdAt: now,
        updatedAt: now,
      );

      // Check if name already exists and modify if needed
      String finalName = profile.name;
      int counter = 1;
      while (await profileNameExists(finalName)) {
        finalName = '${profile.name} ($counter)';
        counter++;
      }

      if (finalName != profile.name) {
        profile = profile.copyWith(name: finalName);
      }

      return await createProfile(profile);
    } catch (e) {
      _logger.e('Error importing profile: $e');
      rethrow;
    }
  }
}