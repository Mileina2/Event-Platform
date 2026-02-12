/**
 * Event controller - HTTP handling only
 */

function createEventController(eventService) {
  const getCurrentUser = (req) => {
    const id = req.headers['x-user-id'];
    if (!id) return null;
    return parseInt(id, 10);
  };

  const getCurrentUserRole = (req) => req.headers['x-user-role'] || 'USER';

  return {
    listByOrganizer(req, res) {
      const userId = getCurrentUser(req);
      if (!userId) return res.status(401).json({ error: 'Missing X-User-Id header' });
      const events = eventService.listByOrganizer(userId);
      res.json(events);
    },
    list(req, res) {
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.search) filters.search = req.query.search;
      if (req.query.dateFrom) filters.dateFrom = req.query.dateFrom;
      if (req.query.dateTo) filters.dateTo = req.query.dateTo;
      if (req.query.organizerId) filters.organizerId = parseInt(req.query.organizerId, 10);
      if (req.query.hasAvailability) filters.hasAvailability = req.query.hasAvailability === 'true';
      const events = eventService.list(filters);
      res.json(events);
    },

    getById(req, res) {
      const id = parseInt(req.params.id, 10);
      const event = eventService.getById(id);
      res.json(event);
    },

    create(req, res) {
      const userId = getCurrentUser(req);
      const userRole = getCurrentUserRole(req);
      if (!userId) {
        return res.status(401).json({ error: 'Missing X-User-Id header' });
      }
      const event = eventService.create(req.body, userId, userRole);
      res.status(201).json(event);
    },

    update(req, res) {
      const id = parseInt(req.params.id, 10);
      const userId = getCurrentUser(req);
      const userRole = getCurrentUserRole(req);
      if (!userId) {
        return res.status(401).json({ error: 'Missing X-User-Id header' });
      }
      const event = eventService.update(id, req.body, userId, userRole);
      res.json(event);
    },

    publish(req, res) {
      const id = parseInt(req.params.id, 10);
      const userId = getCurrentUser(req);
      const userRole = getCurrentUserRole(req);
      if (!userId) {
        return res.status(401).json({ error: 'Missing X-User-Id header' });
      }
      const event = eventService.publish(id, userId, userRole);
      res.json(event);
    },

    close(req, res) {
      const id = parseInt(req.params.id, 10);
      const userId = getCurrentUser(req);
      const userRole = getCurrentUserRole(req);
      if (!userId) {
        return res.status(401).json({ error: 'Missing X-User-Id header' });
      }
      const event = eventService.close(id, userId, userRole);
      res.json(event);
    }
  };
}

module.exports = { createEventController };
