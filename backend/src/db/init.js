/**
 * SQLite database initialization
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../data/events.db');

function initDb() {
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT,
      role TEXT NOT NULL CHECK(role IN ('USER', 'ORGANIZER', 'ADMIN')),
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `);

  // Migration: add passwordHash if missing, set default for existing users
  try {
    const cols = db.prepare('PRAGMA table_info(users)').all();
    if (!cols.some(c => c.name === 'passwordHash')) {
      db.exec('ALTER TABLE users ADD COLUMN passwordHash TEXT');
    }
    const bcrypt = require('bcryptjs');
    const defaultHash = bcrypt.hashSync('password123', 10);
    db.prepare('UPDATE users SET passwordHash = ? WHERE passwordHash IS NULL OR passwordHash = \'\'').run(defaultHash);
  } catch (_) {}

  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      capacity INTEGER NOT NULL CHECK(capacity >= 0),
      status TEXT NOT NULL CHECK(status IN ('DRAFT', 'PUBLISHED', 'CLOSED')),
      organizerId INTEGER NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (organizerId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      UNIQUE(eventId, userId),
      FOREIGN KEY (eventId) REFERENCES events(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS waitlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      UNIQUE(eventId, userId),
      FOREIGN KEY (eventId) REFERENCES events(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT DEFAULT '#3b82f6',
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS event_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventId INTEGER NOT NULL,
      tagId INTEGER NOT NULL,
      UNIQUE(eventId, tagId),
      FOREIGN KEY (eventId) REFERENCES events(id),
      FOREIGN KEY (tagId) REFERENCES tags(id)
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      eventId INTEGER NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      UNIQUE(userId, eventId),
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (eventId) REFERENCES events(id)
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      review TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      UNIQUE(eventId, userId),
      FOREIGN KEY (eventId) REFERENCES events(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS user_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER UNIQUE NOT NULL,
      bio TEXT,
      avatar TEXT,
      location TEXT,
      website TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS user_following (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      followerId INTEGER NOT NULL,
      followingId INTEGER NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      UNIQUE(followerId, followingId),
      FOREIGN KEY (followerId) REFERENCES users(id),
      FOREIGN KEY (followingId) REFERENCES users(id),
      CHECK(followerId != followingId)
    );

    CREATE INDEX IF NOT EXISTS idx_event_tags_event ON event_tags(eventId);
    CREATE INDEX IF NOT EXISTS idx_event_tags_tag ON event_tags(tagId);
    CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(userId);
    CREATE INDEX IF NOT EXISTS idx_favorites_event ON favorites(eventId);
    CREATE INDEX IF NOT EXISTS idx_ratings_event ON ratings(eventId);
    CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(userId);
    CREATE INDEX IF NOT EXISTS idx_following_follower ON user_following(followerId);
    CREATE INDEX IF NOT EXISTS idx_following_following ON user_following(followingId);
    CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizerId);
    CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
    CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
    CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(eventId);
    CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(userId);
  `);

  return db;
}

module.exports = { initDb };
