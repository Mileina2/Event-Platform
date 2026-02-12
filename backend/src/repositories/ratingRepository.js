/**
 * Rating repository - data access for event ratings and reviews
 */

function createRatingRepository(db) {
  return {
    findById(id) {
      return db.prepare('SELECT * FROM ratings WHERE id = ?').get(id) || null;
    },

    findByUserAndEvent(userId, eventId) {
      return db.prepare('SELECT * FROM ratings WHERE userId = ? AND eventId = ?').get(userId, eventId) || null;
    },

    findByEvent(eventId) {
      return db.prepare(`
        SELECT r.*, u.email FROM ratings r
        JOIN users u ON r.userId = u.id
        WHERE r.eventId = ?
        ORDER BY r.createdAt DESC
      `).all(eventId);
    },

    findByUser(userId) {
      return db.prepare(`
        SELECT r.*, e.title FROM ratings r
        JOIN events e ON r.eventId = e.id
        WHERE r.userId = ?
        ORDER BY r.createdAt DESC
      `).all(userId);
    },

    create(eventId, userId, rating, review = null) {
      const existing = this.findByUserAndEvent(userId, eventId);
      if (existing) {
        return this.update(existing.id, rating, review);
      }
      const result = db.prepare(`
        INSERT INTO ratings (eventId, userId, rating, review)
        VALUES (?, ?, ?, ?)
      `).run(eventId, userId, rating, review);
      return this.findById(result.lastInsertRowid);
    },

    update(id, rating, review = null) {
      db.prepare(`
        UPDATE ratings SET rating = ?, review = ?, updatedAt = datetime('now')
        WHERE id = ?
      `).run(rating, review, id);
      return this.findById(id);
    },

    delete(id) {
      return db.prepare('DELETE FROM ratings WHERE id = ?').run(id).changes > 0;
    },

    getAverageRating(eventId) {
      const row = db.prepare(`
        SELECT AVG(rating) as avg, COUNT(*) as count FROM ratings
        WHERE eventId = ?
      `).get(eventId);
      return {
        average: row.avg ? Math.round(row.avg * 10) / 10 : 0,
        count: row.count || 0
      };
    },

    getRatingDistribution(eventId) {
      const distribution = {};
      for (let i = 1; i <= 5; i++) {
        const row = db.prepare('SELECT COUNT(*) as count FROM ratings WHERE eventId = ? AND rating = ?').get(eventId, i);
        distribution[i] = row.count;
      }
      return distribution;
    }
  };
}

module.exports = { createRatingRepository };
