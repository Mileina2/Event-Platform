/**
 * Favorite routes
 */

const express = require('express');

function createFavoriteRoutes(favoriteController) {
  const router = express.Router();
  
  router.get('/users/:userId', (req, res) => favoriteController.getUserFavorites(req, res));
  router.post('/events/:eventId', (req, res) => favoriteController.addFavorite(req, res));
  router.delete('/events/:eventId', (req, res) => favoriteController.removeFavorite(req, res));
  router.get('/events/:eventId/check', (req, res) => favoriteController.checkFavorite(req, res));

  return router;
}

module.exports = { createFavoriteRoutes };
