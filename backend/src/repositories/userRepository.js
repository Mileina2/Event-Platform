/**
 * User repository - data access only
 * toPublic() strips passwordHash for API responses
 */

function toPublic(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

function createUserRepository(db) {
  return {
    findById(id) {
      return db.prepare('SELECT * FROM users WHERE id = ?').get(id) || null;
    },

    findByEmail(email) {
      return db.prepare('SELECT * FROM users WHERE email = ?').get(email) || null;
    },

    findAll() {
      return db.prepare('SELECT id, email, role, createdAt FROM users ORDER BY id').all();
    },

    create({ email, passwordHash, role }) {
      const result = db.prepare(
        'INSERT INTO users (email, passwordHash, role) VALUES (?, ?, ?)'
      ).run(email, passwordHash, role);
      return this.findById(result.lastInsertRowid);
    },

    toPublic
  };
}

module.exports = { createUserRepository };
