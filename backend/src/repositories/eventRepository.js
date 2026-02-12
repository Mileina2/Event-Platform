/**
 * Event repository - data access only
 */

function createEventRepository(db) {
  return {
    findById(id) {
      return db.prepare('SELECT * FROM events WHERE id = ?').get(id) || null;
    },

    findAll(filters = {}) {
      let sql = 'SELECT * FROM events WHERE 1=1';
      const params = [];

      // Filter by status
      if (filters.status) {
        sql += ' AND status = ?';
        params.push(filters.status);
      }

      // Filter by organizer
      if (filters.organizerId) {
        sql += ' AND organizerId = ?';
        params.push(filters.organizerId);
      }

      // Filter by search term (title or description)
      if (filters.search) {
        sql += " AND (title LIKE ? OR description LIKE ?)";
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
      }

      // Filter by date range
      if (filters.dateFrom) {
        sql += ' AND date >= ?';
        params.push(filters.dateFrom);
      }
      if (filters.dateTo) {
        sql += ' AND date <= ?';
        params.push(filters.dateTo);
      }

      // Filter by capacity (only events with available spots)
      if (filters.hasAvailability !== undefined && filters.hasAvailability) {
        sql += ' AND capacity > (SELECT COUNT(*) FROM registrations WHERE eventId = events.id)';
      }

      sql += ' ORDER BY date ASC';
      return params.length ? db.prepare(sql).all(...params) : db.prepare(sql).all();
    },

    create({ title, description, date, capacity, organizerId, status = 'DRAFT' }) {
      const result = db.prepare(
        `INSERT INTO events (title, description, date, capacity, status, organizerId)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(title, description, date, capacity, status, organizerId);
      return this.findById(result.lastInsertRowid);
    },

    update(id, { title, description, date, capacity, status }) {
      const event = this.findById(id);
      if (!event) return null;

      const updates = [];
      const params = [];

      if (title !== undefined) { updates.push('title = ?'); params.push(title); }
      if (description !== undefined) { updates.push('description = ?'); params.push(description); }
      if (date !== undefined) { updates.push('date = ?'); params.push(date); }
      if (capacity !== undefined) { updates.push('capacity = ?'); params.push(capacity); }
      if (status !== undefined) { updates.push('status = ?'); params.push(status); }

      if (updates.length === 0) return event;

      updates.push("updatedAt = datetime('now')");
      params.push(id);
      db.prepare(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      return this.findById(id);
    },

    countRegistrations(eventId) {
      const row = db.prepare(
        'SELECT COUNT(*) as count FROM registrations WHERE eventId = ?'
      ).get(eventId);
      return row.count;
    }
  };
}

module.exports = { createEventRepository };
