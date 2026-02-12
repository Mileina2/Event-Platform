/**
 * Registration routes
 */

const express = require('express');

function createRegistrationRoutes(registrationController) {
  const router = express.Router();
  router.post('/events/:eventId/register', (req, res) =>
    registrationController.register(req, res)
  );
  router.post('/events/:eventId/waitlist', (req, res) => registrationController.joinWaitlist(req, res));
  router.delete('/events/:eventId/waitlist', (req, res) => registrationController.leaveWaitlist(req, res));
  router.get('/events/:eventId/waitlist', (req, res) => registrationController.listWaitlist(req, res));
  router.delete('/events/:eventId/register', (req, res) =>
    registrationController.unregister(req, res)
  );
  router.get('/events/:eventId/registrations', (req, res) =>
    registrationController.listByEvent(req, res)
  );
  router.get('/users/:userId/registrations', (req, res) =>
    registrationController.listByUser(req, res)
  );
  return router;
}

module.exports = { createRegistrationRoutes };
