/**
 * Seed script for development data
 * Can be run standalone (node src/db/seed.js) or via seedDatabase(db)
 * Default password for all seed users: password123
 */

const bcrypt = require('bcryptjs');
const { initDb } = require('./init');

const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

function seedDatabase(db) {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count > 0) {
    return false;
  }

  const insertUser = db.prepare('INSERT INTO users (email, passwordHash, role) VALUES (?, ?, ?)');
  insertUser.run('admin@events.com', DEFAULT_PASSWORD_HASH, 'ADMIN');
  insertUser.run('organizer1@events.com', DEFAULT_PASSWORD_HASH, 'ORGANIZER');
  insertUser.run('organizer2@events.com', DEFAULT_PASSWORD_HASH, 'ORGANIZER');
  insertUser.run('user1@events.com', DEFAULT_PASSWORD_HASH, 'USER');
  insertUser.run('user2@events.com', DEFAULT_PASSWORD_HASH, 'USER');

  db.exec(`
    INSERT INTO events (title, description, date, capacity, status, organizerId) VALUES
      ('Tech Conference 2025', 'Annual tech conference', '2025-06-15T09:00:00.000Z', 200, 'PUBLISHED', 2),
      ('Workshop: Node.js Best Practices', 'Hands-on workshop', '2025-07-20T14:00:00.000Z', 30, 'PUBLISHED', 2),
      ('Upcoming Event Draft', 'Still in preparation', '2025-08-01T10:00:00.000Z', 50, 'DRAFT', 3),
      ('Past Event', 'Already happened', '2024-01-10T09:00:00.000Z', 100, 'PUBLISHED', 2);

    INSERT INTO registrations (eventId, userId) VALUES
      (1, 4),
      (1, 5),
      (2, 4);
  `);

  return true;
}

if (require.main === module) {
  const db = initDb();
  if (seedDatabase(db)) {
    console.log('Database seeded successfully');
  } else {
    console.log('Database already seeded');
  }
}

module.exports = { seedDatabase };
