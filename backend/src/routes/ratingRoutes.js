/**
 * Rating routes
 */

const express = require('express');

function createRatingRoutes(ratingController) {
  const router = express.Router();
  
  router.get('/events/:eventId', (req, res) => ratingController.getEventRatings(req, res));
  router.get('/events/:eventId/stats', (req, res) => ratingController.getEventStats(req, res));
  router.post('/events/:eventId', (req, res) => ratingController.createRating(req, res));
  router.get('/users/:userId', (req, res) => ratingController.getUserRatings(req, res));
  router.patch('/:ratingId', (req, res) => ratingController.updateRating(req, res));
  router.delete('/:ratingId', (req, res) => ratingController.deleteRating(req, res));

  return router;
}

module.exports = { createRatingRoutes };
