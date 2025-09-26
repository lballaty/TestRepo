# File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/focus_productivity_timer/lib/core/database/database_helper.dart
# Description: SQLite database helper for local data storage and management
# Author: Libor Ballaty <libor@arionetworks.com>
# Created: 2025-09-26

import 'dart:io';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';
import 'package:logger/logger.dart';

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper._internal();
  static Database? _database;
  final Logger _logger = Logger();

  factory DatabaseHelper() => _instance;

  DatabaseHelper._internal();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initializeDatabase();
    return _database!;
  }

  Future<Database> _initializeDatabase() async {
    final Directory documentsDirectory = await getApplicationDocumentsDirectory();
    final String path = join(documentsDirectory.path, 'focus_app.db');

    _logger.i('Initializing database at: $path');

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDatabase,
      onUpgrade: _upgradeDatabase,
      onConfigure: _configureDatabase,
    );
  }

  Future<void> _configureDatabase(Database db) async {
    await db.execute('PRAGMA foreign_keys = ON');
  }

  Future<void> _createDatabase(Database db, int version) async {
    _logger.i('Creating database tables...');

    // Create profiles table
    await db.execute('''
      CREATE TABLE profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        duration_minutes INTEGER NOT NULL,
        break_duration_minutes INTEGER DEFAULT 5,
        long_break_duration_minutes INTEGER DEFAULT 15,
        break_frequency INTEGER DEFAULT 4,
        notification_sound_path TEXT,
        theme_config TEXT,
        blocking_config TEXT,
        ai_coaching_enabled INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    ''');

    // Create sequences table
    await db.execute('''
      CREATE TABLE sequences (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        total_duration_minutes INTEGER,
        auto_transition INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    ''');

    // Create sequence_steps table
    await db.execute('''
      CREATE TABLE sequence_steps (
        id TEXT PRIMARY KEY,
        sequence_id TEXT NOT NULL,
        profile_id TEXT NOT NULL,
        step_order INTEGER NOT NULL,
        FOREIGN KEY (sequence_id) REFERENCES sequences(id) ON DELETE CASCADE,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      )
    ''');

    // Create sessions table
    await db.execute('''
      CREATE TABLE sessions (
        id TEXT PRIMARY KEY,
        profile_id TEXT,
        sequence_id TEXT,
        started_at INTEGER NOT NULL,
        completed_at INTEGER,
        planned_duration_minutes INTEGER NOT NULL,
        actual_duration_minutes INTEGER,
        completion_status TEXT CHECK (completion_status IN ('completed', 'stopped', 'interrupted')),
        pause_count INTEGER DEFAULT 0,
        total_pause_duration_minutes INTEGER DEFAULT 0,
        notes TEXT,
        ai_feedback TEXT,
        FOREIGN KEY (profile_id) REFERENCES profiles(id),
        FOREIGN KEY (sequence_id) REFERENCES sequences(id)
      )
    ''');

    // Create goals table
    await db.execute('''
      CREATE TABLE goals (
        id TEXT PRIMARY KEY,
        type TEXT CHECK (type IN ('daily', 'weekly', 'monthly')) NOT NULL,
        target_value INTEGER NOT NULL,
        target_unit TEXT CHECK (target_unit IN ('minutes', 'sessions', 'sequences')) NOT NULL,
        start_date INTEGER NOT NULL,
        end_date INTEGER,
        is_active INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL
      )
    ''');

    // Create user_preferences table
    await db.execute('''
      CREATE TABLE user_preferences (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    ''');

    // Create ai_interactions table
    await db.execute('''
      CREATE TABLE ai_interactions (
        id TEXT PRIMARY KEY,
        interaction_type TEXT NOT NULL,
        input_context TEXT,
        ai_response TEXT,
        user_feedback INTEGER CHECK (user_feedback BETWEEN 1 AND 5),
        created_at INTEGER NOT NULL
      )
    ''');

    // Create usage_analytics table
    await db.execute('''
      CREATE TABLE usage_analytics (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        event_data TEXT,
        session_id TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      )
    ''');

    // Create custom_media table
    await db.execute('''
      CREATE TABLE custom_media (
        id TEXT PRIMARY KEY,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        media_type TEXT CHECK (media_type IN ('audio', 'image')) NOT NULL,
        file_size_bytes INTEGER,
        created_at INTEGER NOT NULL
      )
    ''');

    // Create themes table
    await db.execute('''
      CREATE TABLE themes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        is_built_in INTEGER DEFAULT 0,
        theme_data TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    ''');

    // Create performance indexes
    await _createIndexes(db);

    // Insert default data
    await _insertDefaultData(db);

    _logger.i('Database created successfully');
  }

  Future<void> _createIndexes(Database db) async {
    _logger.i('Creating database indexes...');

    final List<String> indexes = [
      'CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_profile_id ON sessions(profile_id)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_sequence_id ON sessions(sequence_id)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON usage_analytics(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON usage_analytics(event_type)',
      'CREATE INDEX IF NOT EXISTS idx_ai_interactions_type ON ai_interactions(interaction_type)',
      'CREATE INDEX IF NOT EXISTS idx_sequence_steps_sequence_id ON sequence_steps(sequence_id)',
      'CREATE INDEX IF NOT EXISTS idx_sequence_steps_profile_id ON sequence_steps(profile_id)',
      'CREATE INDEX IF NOT EXISTS idx_goals_start_date ON goals(start_date)',
      'CREATE INDEX IF NOT EXISTS idx_goals_is_active ON goals(is_active)',
    ];

    for (String indexQuery in indexes) {
      await db.execute(indexQuery);
    }
  }

  Future<void> _insertDefaultData(Database db) async {
    _logger.i('Inserting default data...');

    final int currentTime = DateTime.now().millisecondsSinceEpoch;

    // Insert default profiles
    await db.insert('profiles', {
      'id': 'profile_work_focus',
      'name': 'Work Focus',
      'description': 'Standard 25-minute work session with 5-minute break',
      'duration_minutes': 25,
      'break_duration_minutes': 5,
      'long_break_duration_minutes': 15,
      'break_frequency': 4,
      'theme_config': '{"color": "#2196F3", "theme": "work"}',
      'blocking_config': '{"enabled": true, "websites": ["facebook.com", "twitter.com", "instagram.com"]}',
      'ai_coaching_enabled': 1,
      'created_at': currentTime,
      'updated_at': currentTime,
    });

    await db.insert('profiles', {
      'id': 'profile_study_deep',
      'name': 'Deep Study',
      'description': '45-minute focused study session',
      'duration_minutes': 45,
      'break_duration_minutes': 10,
      'long_break_duration_minutes': 30,
      'break_frequency': 3,
      'theme_config': '{"color": "#4CAF50", "theme": "study"}',
      'blocking_config': '{"enabled": true, "websites": ["youtube.com", "netflix.com", "reddit.com"]}',
      'ai_coaching_enabled': 1,
      'created_at': currentTime,
      'updated_at': currentTime,
    });

    await db.insert('profiles', {
      'id': 'profile_exercise',
      'name': 'Exercise Session',
      'description': '30-minute workout timer',
      'duration_minutes': 30,
      'break_duration_minutes': 0,
      'long_break_duration_minutes': 0,
      'break_frequency': 0,
      'theme_config': '{"color": "#FF5722", "theme": "exercise"}',
      'blocking_config': '{"enabled": false}',
      'ai_coaching_enabled': 1,
      'created_at': currentTime,
      'updated_at': currentTime,
    });

    await db.insert('profiles', {
      'id': 'profile_meditation',
      'name': 'Meditation',
      'description': '15-minute mindfulness session',
      'duration_minutes': 15,
      'break_duration_minutes': 0,
      'long_break_duration_minutes': 0,
      'break_frequency': 0,
      'theme_config': '{"color": "#9C27B0", "theme": "meditation"}',
      'blocking_config': '{"enabled": false}',
      'ai_coaching_enabled': 1,
      'created_at': currentTime,
      'updated_at': currentTime,
    });

    // Insert default themes
    await db.insert('themes', {
      'id': 'theme_default_light',
      'name': 'Light Theme',
      'is_built_in': 1,
      'theme_data': '{"mode": "light", "primaryColor": "#2196F3", "backgroundColor": "#FFFFFF"}',
      'created_at': currentTime,
    });

    await db.insert('themes', {
      'id': 'theme_default_dark',
      'name': 'Dark Theme',
      'is_built_in': 1,
      'theme_data': '{"mode": "dark", "primaryColor": "#2196F3", "backgroundColor": "#121212"}',
      'created_at': currentTime,
    });

    // Insert default user preferences
    await db.insert('user_preferences', {
      'key': 'theme_mode',
      'value': 'system',
      'updated_at': currentTime,
    });

    await db.insert('user_preferences', {
      'key': 'notifications_enabled',
      'value': 'true',
      'updated_at': currentTime,
    });

    await db.insert('user_preferences', {
      'key': 'ai_coaching_enabled',
      'value': 'true',
      'updated_at': currentTime,
    });

    await db.insert('user_preferences', {
      'key': 'analytics_consent',
      'value': 'false',
      'updated_at': currentTime,
    });
  }

  Future<void> _upgradeDatabase(Database db, int oldVersion, int newVersion) async {
    _logger.i('Upgrading database from version $oldVersion to $newVersion');

    // Handle future database upgrades here
    if (oldVersion < 2) {
      // Add upgrade logic for version 2
    }
  }

  // Database utility methods
  Future<void> closeDatabase() async {
    if (_database != null) {
      await _database!.close();
      _database = null;
    }
  }

  Future<void> deleteDatabase() async {
    final Directory documentsDirectory = await getApplicationDocumentsDirectory();
    final String path = join(documentsDirectory.path, 'focus_app.db');

    if (await File(path).exists()) {
      await File(path).delete();
      _logger.i('Database deleted');
    }

    _database = null;
  }

  Future<bool> databaseExists() async {
    final Directory documentsDirectory = await getApplicationDocumentsDirectory();
    final String path = join(documentsDirectory.path, 'focus_app.db');
    return await File(path).exists();
  }

  Future<void> compactDatabase() async {
    final db = await database;
    await db.execute('VACUUM');
    _logger.i('Database compacted');
  }

  Future<int> getDatabaseSize() async {
    final Directory documentsDirectory = await getApplicationDocumentsDirectory();
    final String path = join(documentsDirectory.path, 'focus_app.db');

    if (await File(path).exists()) {
      final File file = File(path);
      final int size = await file.length();
      return size;
    }

    return 0;
  }

  // Backup and restore methods
  Future<String> createBackup() async {
    final Directory documentsDirectory = await getApplicationDocumentsDirectory();
    final String sourcePath = join(documentsDirectory.path, 'focus_app.db');
    final String backupPath = join(documentsDirectory.path, 'focus_app_backup_${DateTime.now().millisecondsSinceEpoch}.db');

    if (await File(sourcePath).exists()) {
      await File(sourcePath).copy(backupPath);
      _logger.i('Database backup created at: $backupPath');
      return backupPath;
    }

    throw Exception('Database file does not exist');
  }

  Future<void> restoreFromBackup(String backupPath) async {
    if (!await File(backupPath).exists()) {
      throw Exception('Backup file does not exist');
    }

    final Directory documentsDirectory = await getApplicationDocumentsDirectory();
    final String databasePath = join(documentsDirectory.path, 'focus_app.db');

    // Close current database
    await closeDatabase();

    // Replace database with backup
    await File(backupPath).copy(databasePath);

    _logger.i('Database restored from backup');
  }
}