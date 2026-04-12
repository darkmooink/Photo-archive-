import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'archive.db');

let db: Database.Database;

export function initDb(): void {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  runSchema();
}

function runSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_path TEXT NOT NULL,
      clean_path TEXT,
      review_path TEXT,
      labeled_path TEXT,
      status TEXT NOT NULL DEFAULT 'uploaded',
      source_type TEXT,
      title TEXT,
      description TEXT,
      date_taken TEXT,
      date_approximate INTEGER DEFAULT 0,
      location TEXT,
      keywords TEXT,
      corners TEXT,
      error_message TEXT,
      group_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS people (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS photo_people (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      photo_id INTEGER NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
      person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
      face_region TEXT,
      label TEXT,
      UNIQUE(photo_id, person_id)
    );

    CREATE TABLE IF NOT EXISTS photo_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export function getDb(): Database.Database {
  return db;
}
