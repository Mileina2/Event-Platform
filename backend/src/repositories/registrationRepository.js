/**
 * Registration repository - data access only
 */

function createRegistrationRepository(db) {
  return {
    findById(id) {
      return db.prepare('SELECT * FROM registrations WHERE id = ?').get(id) || null;
    },

    findByEvent(eventId) {
      return db.prepare(`
        SELECT r.*, u.email FROM registrations r
        JOIN users u ON r.userId = u.id
        WHERE r.eventId = ?
        ORDER BY r.createdAt ASC
      `).all(eventId);
    },

    findByUser(userId) {
      return db.prepare(`
        SELECT r.*, e.title as eventTitle, e.date as eventDate
        FROM registrations r
        JOIN events e ON r.eventId = e.id
        WHERE r.userId = ?
        ORDER BY e.date ASC
      `).all(userId);
    },

    exists(eventId, userId) {
      const row = db.prepare(
        'SELECT id FROM registrations WHERE eventId = ? AND userId = ?'
      ).get(eventId, userId);
      return !!row;
    },

    create(eventId, userId) {
      const result = db.prepare(
        'INSERT INTO registrations (eventId, userId) VALUES (?, ?)'
      ).run(eventId, userId);
      return this.findById(result.lastInsertRowid);
    },

    delete(id) {
      return db.prepare('DELETE FROM registrations WHERE id = ?').run(id);
    }
  };
}

module.exports = { createRegistrationRepository };
