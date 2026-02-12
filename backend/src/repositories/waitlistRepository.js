/**
 * Waitlist repository - data access for waitlist entries
 */

function createWaitlistRepository(db) {
  return {
    findByEvent(eventId) {
      return db.prepare(`
        SELECT w.*, u.email FROM waitlists w
        JOIN users u ON w.userId = u.id
        WHERE w.eventId = ?
        ORDER BY w.createdAt ASC
      `).all(eventId);
    },

    exists(eventId, userId) {
      const row = db.prepare('SELECT id FROM waitlists WHERE eventId = ? AND userId = ?').get(eventId, userId);
      return !!row;
    },

    create(eventId, userId) {
      const result = db.prepare('INSERT INTO waitlists (eventId, userId) VALUES (?, ?)').run(eventId, userId);
      return db.prepare('SELECT * FROM waitlists WHERE id = ?').get(result.lastInsertRowid);
    },

    deleteById(id) {
      return db.prepare('DELETE FROM waitlists WHERE id = ?').run(id);
    },

    delete(eventId, userId) {
      return db.prepare('DELETE FROM waitlists WHERE eventId = ? AND userId = ?').run(eventId, userId);
    }
  };
}

module.exports = { createWaitlistRepository };
