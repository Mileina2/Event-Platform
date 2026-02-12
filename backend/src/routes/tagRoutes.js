/**
 * Tag routes
 */

const express = require('express');

function createTagRoutes(tagController) {
  const router = express.Router();
  
  router.get('/', (req, res) => tagController.listAll(req, res));
  router.post('/', (req, res) => tagController.create(req, res));
  router.get('/event/:eventId', (req, res) => tagController.getEventTags(req, res));
  router.post('/event/:eventId', (req, res) => tagController.setEventTags(req, res));

  return router;
}

module.exports = { createTagRoutes };
