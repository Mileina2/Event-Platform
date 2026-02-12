/**
 * Favorite controller - HTTP handling for favorites
 */

function createFavoriteController(favoriteRepository) {
  const getCurrentUser = (req) => {
    const id = req.headers['x-user-id'];
    if (!id) return null;
    return parseInt(id, 10);
  };

  return {
    getUserFavorites(req, res) {
      const userId = parseInt(req.params.userId, 10);
      const favorites = favoriteRepository.findByUser(userId);
      res.json(favorites);
    },

    addFavorite(req, res) {
      const userId = getCurrentUser(req);
      const eventId = parseInt(req.params.eventId, 10);
      if (!userId) return res.status(401).json({ error: 'Missing X-User-Id header' });
      try {
        const fav = favoriteRepository.add(userId, eventId);
        res.json(fav);
      } catch (err) {
        res.status(409).json({ error: err.message });
      }
    },

    removeFavorite(req, res) {
      const userId = getCurrentUser(req);
      const eventId = parseInt(req.params.eventId, 10);
      if (!userId) return res.status(401).json({ error: 'Missing X-User-Id header' });
      const removed = favoriteRepository.remove(userId, eventId);
      res.json({ removed });
    },

    checkFavorite(req, res) {
      const userId = getCurrentUser(req);
      const eventId = parseInt(req.params.eventId, 10);
      if (!userId) return res.json({ isFavorite: false });
      const isFavorite = favoriteRepository.isFavorite(userId, eventId);
      res.json({ isFavorite });
    }
  };
}

module.exports = { createFavoriteController };
