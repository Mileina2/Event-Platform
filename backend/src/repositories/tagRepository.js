/**
 * Tag repository - data access for tags and event tags
 */

function createTagRepository(db) {
  return {
    findAll() {
      return db.prepare('SELECT * FROM tags ORDER BY name ASC').all();
    },

    findById(id) {
      return db.prepare('SELECT * FROM tags WHERE id = ?').get(id) || null;
    },

    findByName(name) {
      return db.prepare('SELECT * FROM tags WHERE name = ?').get(name) || null;
    },

    create(name, color = '#3b82f6') {
      const existing = this.findByName(name);
      if (existing) return existing;
      const result = db.prepare('INSERT INTO tags (name, color) VALUES (?, ?)').run(name, color);
      return this.findById(result.lastInsertRowid);
    },

    addTagToEvent(eventId, tagId) {
      try {
        db.prepare('INSERT INTO event_tags (eventId, tagId) VALUES (?, ?)').run(eventId, tagId);
        return true;
      } catch (_) {
        return false; // Already exists
      }
    },

    removeTagFromEvent(eventId, tagId) {
      db.prepare('DELETE FROM event_tags WHERE eventId = ? AND tagId = ?').run(eventId, tagId);
    },

    getEventTags(eventId) {
      return db.prepare(`
        SELECT t.* FROM tags t
        JOIN event_tags et ON t.id = et.tagId
        WHERE et.eventId = ?
        ORDER BY t.name ASC
      `).all(eventId);
    },

    setEventTags(eventId, tagIds) {
      // Remove all existing tags for this event
      db.prepare('DELETE FROM event_tags WHERE eventId = ?').run(eventId);
      // Add new tags
      const stmt = db.prepare('INSERT INTO event_tags (eventId, tagId) VALUES (?, ?)');
      for (const tagId of tagIds) {
        stmt.run(eventId, tagId);
      }
    }
  };
}

module.exports = { createTagRepository };
