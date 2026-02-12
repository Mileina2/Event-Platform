/**
 * Registration controller - HTTP handling only
 */

function createRegistrationController(registrationService) {
  const getCurrentUser = (req) => {
    const id = req.headers['x-user-id'];
    if (!id) return null;
    return parseInt(id, 10);
  };

  return {
    register(req, res) {
      const eventId = parseInt(req.params.eventId, 10);
      const userId = getCurrentUser(req);
      if (!userId) {
        return res.status(401).json({ error: 'Missing X-User-Id header' });
      }
      const registration = registrationService.register(eventId, userId);
      res.status(201).json(registration);
    },

    joinWaitlist(req, res) {
      const eventId = parseInt(req.params.eventId, 10);
      const userId = getCurrentUser(req);
      if (!userId) return res.status(401).json({ error: 'Missing X-User-Id header' });
      const result = registrationService.joinWaitlist(eventId, userId);
      res.status(201).json(result);
    },

    leaveWaitlist(req, res) {
      const eventId = parseInt(req.params.eventId, 10);
      const userId = getCurrentUser(req);
      if (!userId) return res.status(401).json({ error: 'Missing X-User-Id header' });
      registrationService.leaveWaitlist(eventId, userId);
      res.status(204).send();
    },

    unregister(req, res) {
      const eventId = parseInt(req.params.eventId, 10);
      const userId = getCurrentUser(req);
      if (!userId) {
        return res.status(401).json({ error: 'Missing X-User-Id header' });
      }
      registrationService.unregister(eventId, userId);
      res.status(204).send();
    },

    listByEvent(req, res) {
      const eventId = parseInt(req.params.eventId, 10);
      const registrations = registrationService.listByEvent(eventId);
      res.json(registrations);
    },

    listWaitlist(req, res) {
      const eventId = parseInt(req.params.eventId, 10);
      const list = registrationService.listWaitlistByEvent(eventId);
      res.json(list);
    },

    listByUser(req, res) {
      const targetUserId = parseInt(req.params.userId, 10);
      const requesterIdHeader = req.headers['x-user-id'];
      const requesterRole = req.headers['x-user-role'] || 'USER';
      const requesterId = requesterIdHeader ? parseInt(requesterIdHeader, 10) : null;

      if (!requesterId) return res.status(401).json({ error: 'Missing X-User-Id header' });

      // If requester is the same user, allow
      if (requesterId === targetUserId) {
        const registrations = registrationService.listByUser(targetUserId);
        return res.json(registrations);
      }

      // If requester is an organizer, only allow registrations for events they organize
      if (requesterRole === 'ORGANIZER') {
        const registrations = registrationService.listByUser(targetUserId, { organizerId: requesterId });
        return res.json(registrations);
      }

      // Otherwise forbid
      return res.status(403).json({ error: 'Forbidden' });
    }
  };
}

module.exports = { createRegistrationController };
