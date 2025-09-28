// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/focus_productivity_timer/lib/core/repositories/session_repository.dart
// Description: Repository for Session CRUD operations and analytics data access
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-26

import 'package:sqflite/sqflite.dart';
import 'package:logger/logger.dart';
import '../../shared/models/session_model.dart';
import '../database/database_helper.dart';

class SessionRepository {
  final DatabaseHelper _databaseHelper;
  final Logger _logger = Logger();

  SessionRepository(this._databaseHelper);

  /// Create a new session
  Future<Session> createSession(Session session) async {
    try {
      final db = await _databaseHelper.database;

      await db.insert(
        'sessions',
        session.toDatabase(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );

      _logger.i('Created session: ${session.id}');
      return session;
    } catch (e) {
      _logger.e('Error creating session: $e');
      rethrow;
    }
  }

  /// Get a session by ID
  Future<Session?> getSessionById(String id) async {
    try {
      final db = await _databaseHelper.database;

      final List<Map<String, dynamic>> maps = await db.query(
        'sessions',
        where: 'id = ?',
        whereArgs: [id],
        limit: 1,
      );

      if (maps.isEmpty) {
        _logger.w('Session not found: $id');
        return null;
      }

      final session = Session.fromDatabase(maps.first);
      _logger.d('Retrieved session: ${session.id}');
      return session;
    } catch (e) {
      _logger.e('Error getting session by ID: $e');
      rethrow;
    }
  }

  /// Update an existing session
  Future<Session> updateSession(Session session) async {
    try {
      final db = await _databaseHelper.database;

      final rowsAffected = await db.update(
        'sessions',
        session.toDatabase(),
        where: 'id = ?',
        whereArgs: [session.id],
      );

      if (rowsAffected == 0) {
        throw Exception('Session not found: ${session.id}');
      }

      _logger.i('Updated session: ${session.id}');
      return session;
    } catch (e) {
      _logger.e('Error updating session: $e');
      rethrow;
    }
  }

  /// Get all sessions
  Future<List<Session>> getAllSessions({int? limit, int? offset}) async {
    try {
      final db = await _databaseHelper.database;

      String query = 'SELECT * FROM sessions ORDER BY started_at DESC';
      List<dynamic> args = [];

      if (limit != null) {
        query += ' LIMIT ?';
        args.add(limit);
      }

      if (offset != null) {
        query += ' OFFSET ?';
        args.add(offset);
      }

      final List<Map<String, dynamic>> maps = await db.rawQuery(query, args);
      final sessions = maps.map((map) => Session.fromDatabase(map)).toList();

      _logger.d('Retrieved ${sessions.length} sessions');
      return sessions;
    } catch (e) {
      _logger.e('Error getting all sessions: $e');
      rethrow;
    }
  }

  /// Get sessions by profile ID
  Future<List<Session>> getSessionsByProfile(String profileId) async {
    try {
      final db = await _databaseHelper.database;

      final List<Map<String, dynamic>> maps = await db.query(
        'sessions',
        where: 'profile_id = ?',
        whereArgs: [profileId],
        orderBy: 'started_at DESC',
      );

      final sessions = maps.map((map) => Session.fromDatabase(map)).toList();
      _logger.d('Retrieved ${sessions.length} sessions for profile: $profileId');
      return sessions;
    } catch (e) {
      _logger.e('Error getting sessions by profile: $e');
      rethrow;
    }
  }

  /// Get sessions by completion status
  Future<List<Session>> getSessionsByStatus(CompletionStatus status) async {
    try {
      final db = await _databaseHelper.database;

      final List<Map<String, dynamic>> maps = await db.query(
        'sessions',
        where: 'completion_status = ?',
        whereArgs: [status.value],
        orderBy: 'started_at DESC',
      );

      final sessions = maps.map((map) => Session.fromDatabase(map)).toList();
      _logger.d('Retrieved ${sessions.length} sessions with status: ${status.value}');
      return sessions;
    } catch (e) {
      _logger.e('Error getting sessions by status: $e');
      rethrow;
    }
  }

  /// Get sessions within a date range
  Future<List<Session>> getSessionsByDateRange(DateTime startDate, DateTime endDate) async {
    try {
      final db = await _databaseHelper.database;

      final List<Map<String, dynamic>> maps = await db.query(
        'sessions',
        where: 'started_at >= ? AND started_at <= ?',
        whereArgs: [
          startDate.millisecondsSinceEpoch,
          endDate.millisecondsSinceEpoch,
        ],
        orderBy: 'started_at DESC',
      );

      final sessions = maps.map((map) => Session.fromDatabase(map)).toList();
      _logger.d('Retrieved ${sessions.length} sessions between $startDate and $endDate');
      return sessions;
    } catch (e) {
      _logger.e('Error getting sessions by date range: $e');
      rethrow;
    }
  }

  /// Get today's sessions
  Future<List<Session>> getTodaySessions() async {
    final now = DateTime.now();
    final startOfDay = DateTime(now.year, now.month, now.day);
    final endOfDay = startOfDay.add(const Duration(days: 1));

    return await getSessionsByDateRange(startOfDay, endOfDay);
  }

  /// Get this week's sessions
  Future<List<Session>> getThisWeekSessions() async {
    final now = DateTime.now();
    final startOfWeek = now.subtract(Duration(days: now.weekday - 1));
    final startOfWeekMidnight = DateTime(startOfWeek.year, startOfWeek.month, startOfWeek.day);
    final endOfWeek = startOfWeekMidnight.add(const Duration(days: 7));

    return await getSessionsByDateRange(startOfWeekMidnight, endOfWeek);
  }

  /// Get this month's sessions
  Future<List<Session>> getThisMonthSessions() async {
    final now = DateTime.now();
    final startOfMonth = DateTime(now.year, now.month, 1);
    final endOfMonth = DateTime(now.year, now.month + 1, 1);

    return await getSessionsByDateRange(startOfMonth, endOfMonth);
  }

  /// Get active/in-progress session
  Future<Session?> getActiveSession() async {
    try {
      final db = await _databaseHelper.database;

      final List<Map<String, dynamic>> maps = await db.query(
        'sessions',
        where: 'completion_status = ?',
        whereArgs: [CompletionStatus.inProgress.value],
        orderBy: 'started_at DESC',
        limit: 1,
      );

      if (maps.isEmpty) {
        return null;
      }

      final session = Session.fromDatabase(maps.first);
      _logger.d('Retrieved active session: ${session.id}');
      return session;
    } catch (e) {
      _logger.e('Error getting active session: $e');
      rethrow;
    }
  }

  /// Complete a session
  Future<Session> completeSession(String sessionId, {
    CompletionStatus status = CompletionStatus.completed,
    String? notes,
    String? aiFeedback,
  }) async {
    try {
      final session = await getSessionById(sessionId);
      if (session == null) {
        throw Exception('Session not found: $sessionId');
      }

      final now = DateTime.now();
      final actualDuration = now.difference(session.startedAt);

      final completedSession = session.copyWith(
        completedAt: now,
        actualDurationMinutes: actualDuration.inMinutes,
        completionStatus: status,
        notes: notes,
        aiFeedback: aiFeedback,
      );

      return await updateSession(completedSession);
    } catch (e) {
      _logger.e('Error completing session: $e');
      rethrow;
    }
  }

  /// Delete a session
  Future<void> deleteSession(String id) async {
    try {
      final db = await _databaseHelper.database;

      final rowsAffected = await db.delete(
        'sessions',
        where: 'id = ?',
        whereArgs: [id],
      );

      if (rowsAffected == 0) {
        throw Exception('Session not found: $id');
      }

      _logger.i('Deleted session: $id');
    } catch (e) {
      _logger.e('Error deleting session: $e');
      rethrow;
    }
  }

  /// Get session statistics
  Future<SessionStatistics> getSessionStatistics({DateTime? since}) async {
    try {
      final db = await _databaseHelper.database;

      String whereClause = '';
      List<dynamic> whereArgs = [];

      if (since != null) {
        whereClause = 'WHERE started_at >= ?';
        whereArgs.add(since.millisecondsSinceEpoch);
      }

      // Total sessions
      final totalResult = await db.rawQuery(
        'SELECT COUNT(*) as count FROM sessions $whereClause',
        whereArgs,
      );
      final totalSessions = totalResult.first['count'] as int;

      // Completed sessions
      final completedResult = await db.rawQuery(
        'SELECT COUNT(*) as count FROM sessions $whereClause ${whereClause.isEmpty ? 'WHERE' : 'AND'} completion_status = ?',
        [...whereArgs, CompletionStatus.completed.value],
      );
      final completedSessions = completedResult.first['count'] as int;

      // Total focus time
      final focusResult = await db.rawQuery(
        'SELECT SUM(actual_duration_minutes) as total FROM sessions $whereClause ${whereClause.isEmpty ? 'WHERE' : 'AND'} completion_status = ?',
        [...whereArgs, CompletionStatus.completed.value],
      );
      final totalFocusMinutes = (focusResult.first['total'] as int?) ?? 0;

      // Profile usage count
      final profileUsageResult = await db.rawQuery(
        '''SELECT p.name, COUNT(s.id) as count
           FROM sessions s
           JOIN profiles p ON s.profile_id = p.id
           $whereClause
           GROUP BY s.profile_id, p.name''',
        whereArgs,
      );

      final profileUsageCount = <String, int>{};
      for (final row in profileUsageResult) {
        profileUsageCount[row['name'] as String] = row['count'] as int;
      }

      // Calculate streak
      final currentStreak = await _calculateCurrentStreak();
      final longestStreak = await _calculateLongestStreak();

      // Last session date
      final lastSessionResult = await db.rawQuery(
        'SELECT MAX(started_at) as last_session FROM sessions $whereClause',
        whereArgs,
      );
      final lastSessionTimestamp = lastSessionResult.first['last_session'] as int?;
      final lastSessionDate = lastSessionTimestamp != null
          ? DateTime.fromMillisecondsSinceEpoch(lastSessionTimestamp)
          : null;

      final statistics = SessionStatistics(
        totalSessions: totalSessions,
        completedSessions: completedSessions,
        totalFocusMinutes: totalFocusMinutes,
        averageCompletionRate: totalSessions > 0 ? completedSessions / totalSessions : 0.0,
        currentStreak: currentStreak,
        longestStreak: longestStreak,
        lastSessionDate: lastSessionDate,
        profileUsageCount: profileUsageCount,
      );

      _logger.d('Generated session statistics: $totalSessions total, $completedSessions completed');
      return statistics;
    } catch (e) {
      _logger.e('Error getting session statistics: $e');
      rethrow;
    }
  }

  /// Get daily session summary
  Future<Map<DateTime, int>> getDailySessionCounts(int days) async {
    try {
      final db = await _databaseHelper.database;
      final startDate = DateTime.now().subtract(Duration(days: days));

      final result = await db.rawQuery('''
        SELECT
          DATE(started_at / 1000, 'unixepoch') as date,
          COUNT(*) as count
        FROM sessions
        WHERE started_at >= ?
        GROUP BY DATE(started_at / 1000, 'unixepoch')
        ORDER BY date
      ''', [startDate.millisecondsSinceEpoch]);

      final dailyCounts = <DateTime, int>{};
      for (final row in result) {
        final dateStr = row['date'] as String;
        final date = DateTime.parse(dateStr);
        final count = row['count'] as int;
        dailyCounts[date] = count;
      }

      _logger.d('Retrieved daily session counts for $days days');
      return dailyCounts;
    } catch (e) {
      _logger.e('Error getting daily session counts: $e');
      rethrow;
    }
  }

  /// Get session quality distribution
  Future<Map<SessionQuality, int>> getSessionQualityDistribution() async {
    try {
      final sessions = await getAllSessions();
      final qualityDistribution = <SessionQuality, int>{
        SessionQuality.excellent: 0,
        SessionQuality.good: 0,
        SessionQuality.fair: 0,
        SessionQuality.poor: 0,
        SessionQuality.incomplete: 0,
      };

      for (final session in sessions) {
        qualityDistribution[session.quality] =
            (qualityDistribution[session.quality] ?? 0) + 1;
      }

      _logger.d('Retrieved session quality distribution');
      return qualityDistribution;
    } catch (e) {
      _logger.e('Error getting session quality distribution: $e');
      rethrow;
    }
  }

  /// Export sessions as CSV data
  Future<String> exportSessionsAsCSV({DateTime? startDate, DateTime? endDate}) async {
    try {
      List<Session> sessions;

      if (startDate != null && endDate != null) {
        sessions = await getSessionsByDateRange(startDate, endDate);
      } else {
        sessions = await getAllSessions();
      }

      final csvBuffer = StringBuffer();

      // CSV Header
      csvBuffer.writeln('ID,Profile ID,Sequence ID,Started At,Completed At,Planned Duration (min),Actual Duration (min),Status,Pause Count,Total Pause Duration (min),Notes');

      // CSV Data
      for (final session in sessions) {
        csvBuffer.writeln([
          session.id,
          session.profileId ?? '',
          session.sequenceId ?? '',
          session.startedAt.toIso8601String(),
          session.completedAt?.toIso8601String() ?? '',
          session.plannedDurationMinutes,
          session.actualDurationMinutes ?? '',
          session.completionStatus.value,
          session.pauseCount,
          session.totalPauseDurationMinutes,
          '"${session.notes?.replaceAll('"', '""') ?? ''}"',
        ].join(','));
      }

      _logger.i('Exported ${sessions.length} sessions to CSV');
      return csvBuffer.toString();
    } catch (e) {
      _logger.e('Error exporting sessions as CSV: $e');
      rethrow;
    }
  }

  /// Calculate current streak of consecutive productive days
  Future<int> _calculateCurrentStreak() async {
    try {
      final db = await _databaseHelper.database;

      // Get days with completed sessions, ordered by date descending
      final result = await db.rawQuery('''
        SELECT DISTINCT DATE(started_at / 1000, 'unixepoch') as date
        FROM sessions
        WHERE completion_status = ?
        ORDER BY date DESC
      ''', [CompletionStatus.completed.value]);

      if (result.isEmpty) return 0;

      int streak = 0;
      DateTime? previousDate;

      for (final row in result) {
        final dateStr = row['date'] as String;
        final date = DateTime.parse(dateStr);

        if (previousDate == null) {
          // First date
          final today = DateTime.now();
          final daysDiff = today.difference(date).inDays;

          if (daysDiff <= 1) {
            streak = 1;
            previousDate = date;
          } else {
            break; // No streak if last session wasn't yesterday or today
          }
        } else {
          final daysDiff = previousDate.difference(date).inDays;

          if (daysDiff == 1) {
            streak++;
            previousDate = date;
          } else {
            break; // Streak broken
          }
        }
      }

      return streak;
    } catch (e) {
      _logger.e('Error calculating current streak: $e');
      return 0;
    }
  }

  /// Calculate longest streak of consecutive productive days
  Future<int> _calculateLongestStreak() async {
    try {
      final db = await _databaseHelper.database;

      // Get all days with completed sessions, ordered by date
      final result = await db.rawQuery('''
        SELECT DISTINCT DATE(started_at / 1000, 'unixepoch') as date
        FROM sessions
        WHERE completion_status = ?
        ORDER BY date ASC
      ''', [CompletionStatus.completed.value]);

      if (result.isEmpty) return 0;

      int longestStreak = 1;
      int currentStreak = 1;
      DateTime? previousDate;

      for (final row in result) {
        final dateStr = row['date'] as String;
        final date = DateTime.parse(dateStr);

        if (previousDate != null) {
          final daysDiff = date.difference(previousDate).inDays;

          if (daysDiff == 1) {
            currentStreak++;
            longestStreak = currentStreak > longestStreak ? currentStreak : longestStreak;
          } else {
            currentStreak = 1;
          }
        }

        previousDate = date;
      }

      return longestStreak;
    } catch (e) {
      _logger.e('Error calculating longest streak: $e');
      return 0;
    }
  }

  /// Delete sessions older than specified days
  Future<int> cleanupOldSessions(int olderThanDays) async {
    try {
      final db = await _databaseHelper.database;
      final cutoffDate = DateTime.now().subtract(Duration(days: olderThanDays));

      final rowsDeleted = await db.delete(
        'sessions',
        where: 'started_at < ?',
        whereArgs: [cutoffDate.millisecondsSinceEpoch],
      );

      _logger.i('Cleaned up $rowsDeleted old sessions (older than $olderThanDays days)');
      return rowsDeleted;
    } catch (e) {
      _logger.e('Error cleaning up old sessions: $e');
      rethrow;
    }
  }

  /// Get total session count
  Future<int> getSessionCount() async {
    try {
      final db = await _databaseHelper.database;

      final result = await db.rawQuery('SELECT COUNT(*) as count FROM sessions');
      final count = result.first['count'] as int;

      _logger.d('Total session count: $count');
      return count;
    } catch (e) {
      _logger.e('Error getting session count: $e');
      rethrow;
    }
  }
}