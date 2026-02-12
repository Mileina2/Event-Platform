/**
 * Favorite repository - data access for user favorites
 */

function createFavoriteRepository(db) {
  return {
    findByUserAndEvent(userId, eventId) {
      return db.prepare('SELECT * FROM favorites WHERE userId = ? AND eventId = ?').get(userId, eventId) || null;
    },

    findByUser(userId) {
      return db.prepare(`
        SELECT f.*, e.* FROM favorites f
        JOIN events e ON f.eventId = e.id
        WHERE f.userId = ?
        ORDER BY f.createdAt DESC
      `).all(userId);
    },

    add(userId, eventId) {
      try {
        const result = db.prepare('INSERT INTO favorites (userId, eventId) VALUES (?, ?)').run(userId, eventId);
        return this.findByUserAndEvent(userId, eventId);
      } catch (err) {
        throw new Error('Already favorited');
      }
    },

    remove(userId, eventId) {
      const result = db.prepare('DELETE FROM favorites WHERE userId = ? AND eventId = ?').run(userId, eventId);
      return result.changes > 0;
    },

    isFavorite(userId, eventId) {
      const fav = this.findByUserAndEvent(userId, eventId);
      return !!fav;
    },

    countByEvent(eventId) {
      const row = db.prepare('SELECT COUNT(*) as count FROM favorites WHERE eventId = ?').get(eventId);
      return row.count;
    }
  };
}

module.exports = { createFavoriteRepository };
