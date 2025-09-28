// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/focus_productivity_timer/lib/core/repositories/sequence_repository.dart
// Description: Repository for Sequence and SequenceStep CRUD operations and data access
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-26

import 'package:sqflite/sqflite.dart';
import 'package:logger/logger.dart';
import '../../shared/models/sequence_model.dart';
import '../database/database_helper.dart';
import 'profile_repository.dart';

class SequenceRepository {
  final DatabaseHelper _databaseHelper;
  final ProfileRepository _profileRepository;
  final Logger _logger = Logger();

  SequenceRepository(this._databaseHelper, this._profileRepository);

  /// Create a new sequence with its steps
  Future<Sequence> createSequence(Sequence sequence) async {
    try {
      final db = await _databaseHelper.database;

      await db.transaction((txn) async {
        // Insert sequence
        await txn.insert(
          'sequences',
          sequence.toDatabase(),
          conflictAlgorithm: ConflictAlgorithm.replace,
        );

        // Insert sequence steps
        for (final step in sequence.steps) {
          await txn.insert(
            'sequence_steps',
            step.toDatabase(),
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        }
      });

      _logger.i('Created sequence: ${sequence.name} with ${sequence.steps.length} steps');
      return sequence;
    } catch (e) {
      _logger.e('Error creating sequence: $e');
      rethrow;
    }
  }

  /// Get a sequence by ID with its steps and profiles
  Future<Sequence?> getSequenceById(String id) async {
    try {
      final db = await _databaseHelper.database;

      // Get sequence data
      final List<Map<String, dynamic>> sequenceMaps = await db.query(
        'sequences',
        where: 'id = ?',
        whereArgs: [id],
        limit: 1,
      );

      if (sequenceMaps.isEmpty) {
        _logger.w('Sequence not found: $id');
        return null;
      }

      // Get sequence steps
      final List<Map<String, dynamic>> stepMaps = await db.query(
        'sequence_steps',
        where: 'sequence_id = ?',
        whereArgs: [id],
        orderBy: 'step_order ASC',
      );

      // Load profiles for each step
      final List<SequenceStep> steps = [];
      for (final stepMap in stepMaps) {
        final profileId = stepMap['profile_id'] as String;
        final profile = await _profileRepository.getProfileById(profileId);

        final step = SequenceStep.fromDatabase(stepMap, profile: profile);
        steps.add(step);
      }

      final sequence = Sequence.fromDatabase(
        sequenceData: sequenceMaps.first,
        sequenceSteps: steps,
      );

      _logger.d('Retrieved sequence: ${sequence.name} with ${steps.length} steps');
      return sequence;
    } catch (e) {
      _logger.e('Error getting sequence by ID: $e');
      rethrow;
    }
  }

  /// Get all sequences with their steps
  Future<List<Sequence>> getAllSequences() async {
    try {
      final db = await _databaseHelper.database;

      final List<Map<String, dynamic>> sequenceMaps = await db.query(
        'sequences',
        orderBy: 'created_at DESC',
      );

      final List<Sequence> sequences = [];

      for (final sequenceMap in sequenceMaps) {
        final sequenceId = sequenceMap['id'] as String;

        // Get steps for this sequence
        final List<Map<String, dynamic>> stepMaps = await db.query(
          'sequence_steps',
          where: 'sequence_id = ?',
          whereArgs: [sequenceId],
          orderBy: 'step_order ASC',
        );

        // Load profiles for each step
        final List<SequenceStep> steps = [];
        for (final stepMap in stepMaps) {
          final profileId = stepMap['profile_id'] as String;
          final profile = await _profileRepository.getProfileById(profileId);

          final step = SequenceStep.fromDatabase(stepMap, profile: profile);
          steps.add(step);
        }

        final sequence = Sequence.fromDatabase(
          sequenceData: sequenceMap,
          sequenceSteps: steps,
        );

        sequences.add(sequence);
      }

      _logger.d('Retrieved ${sequences.length} sequences');
      return sequences;
    } catch (e) {
      _logger.e('Error getting all sequences: $e');
      rethrow;
    }
  }

  /// Get sequences by category
  Future<List<Sequence>> getSequencesByCategory(SequenceCategory category) async {
    try {
      final allSequences = await getAllSequences();
      final filteredSequences = allSequences
          .where((sequence) => sequence.category == category)
          .toList();

      _logger.d('Retrieved ${filteredSequences.length} sequences for category: ${category.name}');
      return filteredSequences;
    } catch (e) {
      _logger.e('Error getting sequences by category: $e');
      rethrow;
    }
  }

  /// Search sequences by name or description
  Future<List<Sequence>> searchSequences(String query) async {
    try {
      final db = await _databaseHelper.database;

      final List<Map<String, dynamic>> sequenceMaps = await db.query(
        'sequences',
        where: 'name LIKE ? OR description LIKE ?',
        whereArgs: ['%$query%', '%$query%'],
        orderBy: 'created_at DESC',
      );

      final List<Sequence> sequences = [];

      for (final sequenceMap in sequenceMaps) {
        final sequenceId = sequenceMap['id'] as String;
        final sequence = await getSequenceById(sequenceId);
        if (sequence != null) {
          sequences.add(sequence);
        }
      }

      _logger.d('Found ${sequences.length} sequences matching: $query');
      return sequences;
    } catch (e) {
      _logger.e('Error searching sequences: $e');
      rethrow;
    }
  }

  /// Update a sequence and its steps
  Future<Sequence> updateSequence(Sequence sequence) async {
    try {
      final db = await _databaseHelper.database;

      final updatedSequence = sequence.copyWith(
        updatedAt: DateTime.now(),
      );

      await db.transaction((txn) async {
        // Update sequence
        final rowsAffected = await txn.update(
          'sequences',
          updatedSequence.toDatabase(),
          where: 'id = ?',
          whereArgs: [sequence.id],
        );

        if (rowsAffected == 0) {
          throw Exception('Sequence not found: ${sequence.id}');
        }

        // Delete existing steps
        await txn.delete(
          'sequence_steps',
          where: 'sequence_id = ?',
          whereArgs: [sequence.id],
        );

        // Insert updated steps
        for (final step in sequence.steps) {
          await txn.insert(
            'sequence_steps',
            step.toDatabase(),
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        }
      });

      _logger.i('Updated sequence: ${sequence.name}');
      return updatedSequence;
    } catch (e) {
      _logger.e('Error updating sequence: $e');
      rethrow;
    }
  }

  /// Delete a sequence and its steps
  Future<void> deleteSequence(String id) async {
    try {
      final db = await _databaseHelper.database;

      // Check if sequence exists
      final sequence = await getSequenceById(id);
      if (sequence == null) {
        throw Exception('Sequence not found: $id');
      }

      // Check if sequence is used in any sessions
      final sessionUsage = await _checkSequenceUsageInSessions(id);
      if (sessionUsage > 0) {
        throw Exception('Cannot delete sequence: Used in $sessionUsage session(s)');
      }

      await db.transaction((txn) async {
        // Delete sequence steps first (due to foreign key constraint)
        await txn.delete(
          'sequence_steps',
          where: 'sequence_id = ?',
          whereArgs: [id],
        );

        // Delete sequence
        final rowsAffected = await txn.delete(
          'sequences',
          where: 'id = ?',
          whereArgs: [id],
        );

        if (rowsAffected == 0) {
          throw Exception('Failed to delete sequence: $id');
        }
      });

      _logger.i('Deleted sequence: ${sequence.name} ($id)');
    } catch (e) {
      _logger.e('Error deleting sequence: $e');
      rethrow;
    }
  }

  /// Add a step to an existing sequence
  Future<Sequence> addStepToSequence(String sequenceId, SequenceStep step) async {
    try {
      final sequence = await getSequenceById(sequenceId);
      if (sequence == null) {
        throw Exception('Sequence not found: $sequenceId');
      }

      final db = await _databaseHelper.database;

      // Insert new step
      await db.insert(
        'sequence_steps',
        step.toDatabase(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );

      // Recalculate total duration
      final updatedSteps = [...sequence.steps, step];
      final totalDuration = updatedSteps.fold(0, (total, step) => total + step.durationMinutes);

      final updatedSequence = sequence.copyWith(
        steps: updatedSteps,
        totalDurationMinutes: totalDuration,
        updatedAt: DateTime.now(),
      );

      await db.update(
        'sequences',
        updatedSequence.toDatabase(),
        where: 'id = ?',
        whereArgs: [sequenceId],
      );

      _logger.i('Added step to sequence: ${sequence.name}');
      return updatedSequence;
    } catch (e) {
      _logger.e('Error adding step to sequence: $e');
      rethrow;
    }
  }

  /// Remove a step from a sequence
  Future<Sequence> removeStepFromSequence(String sequenceId, String stepId) async {
    try {
      final sequence = await getSequenceById(sequenceId);
      if (sequence == null) {
        throw Exception('Sequence not found: $sequenceId');
      }

      final db = await _databaseHelper.database;

      await db.transaction((txn) async {
        // Delete the step
        final rowsAffected = await txn.delete(
          'sequence_steps',
          where: 'id = ? AND sequence_id = ?',
          whereArgs: [stepId, sequenceId],
        );

        if (rowsAffected == 0) {
          throw Exception('Step not found: $stepId');
        }

        // Reorder remaining steps
        final remainingSteps = sequence.steps.where((step) => step.id != stepId).toList();

        for (int i = 0; i < remainingSteps.length; i++) {
          final step = remainingSteps[i];
          final updatedStep = step.copyWith(stepOrder: i);

          await txn.update(
            'sequence_steps',
            updatedStep.toDatabase(),
            where: 'id = ?',
            whereArgs: [step.id],
          );
        }

        // Update sequence total duration
        final totalDuration = remainingSteps.fold(0, (total, step) => total + step.durationMinutes);

        final updatedSequence = sequence.copyWith(
          totalDurationMinutes: totalDuration,
          updatedAt: DateTime.now(),
        );

        await txn.update(
          'sequences',
          updatedSequence.toDatabase(),
          where: 'id = ?',
          whereArgs: [sequenceId],
        );
      });

      _logger.i('Removed step from sequence: ${sequence.name}');
      return await getSequenceById(sequenceId) ?? sequence;
    } catch (e) {
      _logger.e('Error removing step from sequence: $e');
      rethrow;
    }
  }

  /// Reorder steps in a sequence
  Future<Sequence> reorderSequenceSteps(String sequenceId, List<String> stepIds) async {
    try {
      final sequence = await getSequenceById(sequenceId);
      if (sequence == null) {
        throw Exception('Sequence not found: $sequenceId');
      }

      final db = await _databaseHelper.database;

      await db.transaction((txn) async {
        for (int i = 0; i < stepIds.length; i++) {
          final stepId = stepIds[i];

          await txn.update(
            'sequence_steps',
            {'step_order': i},
            where: 'id = ? AND sequence_id = ?',
            whereArgs: [stepId, sequenceId],
          );
        }

        // Update sequence timestamp
        await txn.update(
          'sequences',
          {'updated_at': DateTime.now().millisecondsSinceEpoch},
          where: 'id = ?',
          whereArgs: [sequenceId],
        );
      });

      _logger.i('Reordered steps for sequence: ${sequence.name}');
      return await getSequenceById(sequenceId) ?? sequence;
    } catch (e) {
      _logger.e('Error reordering sequence steps: $e');
      rethrow;
    }
  }

  /// Duplicate a sequence with a new name
  Future<Sequence> duplicateSequence(String sequenceId, String newName) async {
    try {
      final originalSequence = await getSequenceById(sequenceId);
      if (originalSequence == null) {
        throw Exception('Sequence not found: $sequenceId');
      }

      // Generate new IDs and timestamp
      final now = DateTime.now();
      final newSequenceId = 'sequence_${now.millisecondsSinceEpoch}';

      // Create new steps with new IDs
      final newSteps = originalSequence.steps.asMap().entries.map((entry) {
        final index = entry.key;
        final step = entry.value;

        return step.copyWith(
          id: 'step_${now.millisecondsSinceEpoch}_$index',
          sequenceId: newSequenceId,
        );
      }).toList();

      final duplicatedSequence = originalSequence.copyWith(
        id: newSequenceId,
        name: newName,
        steps: newSteps,
        createdAt: now,
        updatedAt: now,
      );

      return await createSequence(duplicatedSequence);
    } catch (e) {
      _logger.e('Error duplicating sequence: $e');
      rethrow;
    }
  }

  /// Get sequences that use a specific profile
  Future<List<Sequence>> getSequencesUsingProfile(String profileId) async {
    try {
      final db = await _databaseHelper.database;

      final List<Map<String, dynamic>> stepMaps = await db.query(
        'sequence_steps',
        where: 'profile_id = ?',
        whereArgs: [profileId],
      );

      final sequenceIds = stepMaps.map((map) => map['sequence_id'] as String).toSet();
      final sequences = <Sequence>[];

      for (final sequenceId in sequenceIds) {
        final sequence = await getSequenceById(sequenceId);
        if (sequence != null) {
          sequences.add(sequence);
        }
      }

      _logger.d('Found ${sequences.length} sequences using profile: $profileId');
      return sequences;
    } catch (e) {
      _logger.e('Error getting sequences using profile: $e');
      rethrow;
    }
  }

  /// Get the most frequently used sequences
  Future<List<Sequence>> getMostUsedSequences({int limit = 10}) async {
    try {
      final db = await _databaseHelper.database;

      final List<Map<String, dynamic>> maps = await db.rawQuery('''
        SELECT s.*, COUNT(sess.id) as usage_count
        FROM sequences s
        LEFT JOIN sessions sess ON s.id = sess.sequence_id
        GROUP BY s.id
        ORDER BY usage_count DESC, s.created_at DESC
        LIMIT ?
      ''', [limit]);

      final sequences = <Sequence>[];

      for (final map in maps) {
        final sequenceId = map['id'] as String;
        final sequence = await getSequenceById(sequenceId);
        if (sequence != null) {
          sequences.add(sequence);
        }
      }

      _logger.d('Retrieved ${sequences.length} most used sequences');
      return sequences;
    } catch (e) {
      _logger.e('Error getting most used sequences: $e');
      rethrow;
    }
  }

  /// Check if a sequence name already exists
  Future<bool> sequenceNameExists(String name, {String? excludeId}) async {
    try {
      final db = await _databaseHelper.database;

      String whereClause = 'LOWER(name) = LOWER(?)';
      List<dynamic> whereArgs = [name];

      if (excludeId != null) {
        whereClause += ' AND id != ?';
        whereArgs.add(excludeId);
      }

      final List<Map<String, dynamic>> maps = await db.query(
        'sequences',
        where: whereClause,
        whereArgs: whereArgs,
        limit: 1,
      );

      return maps.isNotEmpty;
    } catch (e) {
      _logger.e('Error checking sequence name existence: $e');
      rethrow;
    }
  }

  /// Get total count of sequences
  Future<int> getSequenceCount() async {
    try {
      final db = await _databaseHelper.database;

      final result = await db.rawQuery('SELECT COUNT(*) as count FROM sequences');
      final count = result.first['count'] as int;

      _logger.d('Total sequence count: $count');
      return count;
    } catch (e) {
      _logger.e('Error getting sequence count: $e');
      rethrow;
    }
  }

  /// Export sequence data as JSON
  Future<Map<String, dynamic>> exportSequence(String sequenceId) async {
    try {
      final sequence = await getSequenceById(sequenceId);
      if (sequence == null) {
        throw Exception('Sequence not found: $sequenceId');
      }

      final exportData = {
        'sequence': sequence.toJson(),
        'profiles': sequence.steps.map((step) => step.profile?.toJson()).where((p) => p != null).toList(),
        'exported_at': DateTime.now().toIso8601String(),
        'version': '1.0',
      };

      _logger.i('Exported sequence: ${sequence.name}');
      return exportData;
    } catch (e) {
      _logger.e('Error exporting sequence: $e');
      rethrow;
    }
  }

  /// Import sequence from JSON data
  Future<Sequence> importSequence(Map<String, dynamic> importData) async {
    try {
      if (!importData.containsKey('sequence')) {
        throw Exception('Invalid import data: missing sequence');
      }

      final sequenceData = importData['sequence'] as Map<String, dynamic>;
      var sequence = Sequence.fromJson(sequenceData);

      // Generate new ID and timestamps to avoid conflicts
      final now = DateTime.now();
      final newSequenceId = 'sequence_${now.millisecondsSinceEpoch}';

      // Update step IDs and sequence references
      final newSteps = sequence.steps.asMap().entries.map((entry) {
        final index = entry.key;
        final step = entry.value;

        return step.copyWith(
          id: 'step_${now.millisecondsSinceEpoch}_$index',
          sequenceId: newSequenceId,
        );
      }).toList();

      sequence = sequence.copyWith(
        id: newSequenceId,
        steps: newSteps,
        createdAt: now,
        updatedAt: now,
      );

      // Check if name already exists and modify if needed
      String finalName = sequence.name;
      int counter = 1;
      while (await sequenceNameExists(finalName)) {
        finalName = '${sequence.name} ($counter)';
        counter++;
      }

      if (finalName != sequence.name) {
        sequence = sequence.copyWith(name: finalName);
      }

      return await createSequence(sequence);
    } catch (e) {
      _logger.e('Error importing sequence: $e');
      rethrow;
    }
  }

  /// Private helper to check sequence usage in sessions
  Future<int> _checkSequenceUsageInSessions(String sequenceId) async {
    try {
      final db = await _databaseHelper.database;

      final result = await db.rawQuery(
        'SELECT COUNT(*) as count FROM sessions WHERE sequence_id = ?',
        [sequenceId],
      );

      return result.first['count'] as int;
    } catch (e) {
      _logger.e('Error checking sequence usage in sessions: $e');
      return 0;
    }
  }

  /// Get sequence statistics
  Future<Map<String, dynamic>> getSequenceStatistics() async {
    try {
      final db = await _databaseHelper.database;

      // Total sequences
      final totalResult = await db.rawQuery('SELECT COUNT(*) as count FROM sequences');
      final totalSequences = totalResult.first['count'] as int;

      // Average sequence length
      final avgResult = await db.rawQuery('''
        SELECT AVG(step_count) as avg_length
        FROM (
          SELECT sequence_id, COUNT(*) as step_count
          FROM sequence_steps
          GROUP BY sequence_id
        )
      ''');
      final avgLength = (avgResult.first['avg_length'] as double?) ?? 0.0;

      // Most popular sequence category
      final sequences = await getAllSequences();
      final categoryCount = <SequenceCategory, int>{};

      for (final sequence in sequences) {
        categoryCount[sequence.category] = (categoryCount[sequence.category] ?? 0) + 1;
      }

      final mostPopularCategory = categoryCount.entries
          .reduce((a, b) => a.value > b.value ? a : b)
          .key;

      final statistics = {
        'total_sequences': totalSequences,
        'average_length': avgLength,
        'most_popular_category': mostPopularCategory.name,
        'category_distribution': categoryCount.map((key, value) => MapEntry(key.name, value)),
      };

      _logger.d('Generated sequence statistics');
      return statistics;
    } catch (e) {
      _logger.e('Error getting sequence statistics: $e');
      rethrow;
    }
  }
}