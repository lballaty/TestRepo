// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/focus_productivity_timer/lib/shared/providers/database_provider.dart
// Description: Database provider for dependency injection and initialization
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-26

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sqflite/sqflite.dart';
import '../../core/database/database_helper.dart';

/// Provider for DatabaseHelper singleton instance
final databaseHelperProvider = Provider<DatabaseHelper>((ref) {
  return DatabaseHelper();
});

/// Provider for the actual database instance
final databaseProvider = FutureProvider<Database>((ref) async {
  final databaseHelper = ref.watch(databaseHelperProvider);
  return await databaseHelper.database;
});

/// Provider for database initialization status
final databaseInitializationProvider = FutureProvider<bool>((ref) async {
  final databaseHelper = ref.watch(databaseHelperProvider);
  try {
    await databaseHelper.database;
    return true;
  } catch (e) {
    return false;
  }
});

/// Provider to check if database exists
final databaseExistsProvider = FutureProvider<bool>((ref) async {
  final databaseHelper = ref.watch(databaseHelperProvider);
  return await databaseHelper.databaseExists();
});

/// Provider for database size information
final databaseSizeProvider = FutureProvider<int>((ref) async {
  final databaseHelper = ref.watch(databaseHelperProvider);
  return await databaseHelper.getDatabaseSize();
});

/// Provider for database maintenance operations
final databaseMaintenanceProvider = Provider<DatabaseMaintenanceService>((ref) {
  final databaseHelper = ref.watch(databaseHelperProvider);
  return DatabaseMaintenanceService(databaseHelper);
});

/// Service class for database maintenance operations
class DatabaseMaintenanceService {
  final DatabaseHelper _databaseHelper;

  DatabaseMaintenanceService(this._databaseHelper);

  /// Compact the database to reduce file size
  Future<void> compactDatabase() async {
    await _databaseHelper.compactDatabase();
  }

  /// Create a backup of the database
  Future<String> createBackup() async {
    return await _databaseHelper.createBackup();
  }

  /// Restore database from a backup file
  Future<void> restoreFromBackup(String backupPath) async {
    await _databaseHelper.restoreFromBackup(backupPath);
  }

  /// Delete the entire database (use with caution)
  Future<void> deleteDatabase() async {
    await _databaseHelper.deleteDatabase();
  }

  /// Close the database connection
  Future<void> closeDatabase() async {
    await _databaseHelper.closeDatabase();
  }

  /// Get database file size in bytes
  Future<int> getDatabaseSize() async {
    return await _databaseHelper.getDatabaseSize();
  }

  /// Check if database file exists
  Future<bool> databaseExists() async {
    return await _databaseHelper.databaseExists();
  }
}