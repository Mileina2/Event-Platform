/**
 * Event routes
 */

const express = require('express');

function createEventRoutes(eventController) {
  const router = express.Router();
  router.get('/mine', (req, res) => eventController.listByOrganizer(req, res));
  router.get('/', (req, res) => eventController.list(req, res));
  router.get('/:id', (req, res) => eventController.getById(req, res));
  router.post('/', (req, res) => eventController.create(req, res));
  router.patch('/:id', (req, res) => eventController.update(req, res));
  router.post('/:id/publish', (req, res) => eventController.publish(req, res));
  router.post('/:id/close', (req, res) => eventController.close(req, res));
  return router;
}

module.exports = { createEventRoutes };
