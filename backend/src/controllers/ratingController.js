/**
 * Rating controller - HTTP handling for ratings and reviews
 */

function createRatingController(ratingRepository) {
  const getCurrentUser = (req) => {
    const id = req.headers['x-user-id'];
    if (!id) return null;
    return parseInt(id, 10);
  };

  return {
    getEventRatings(req, res) {
      const eventId = parseInt(req.params.eventId, 10);
      const ratings = ratingRepository.findByEvent(eventId);
      const stats = ratingRepository.getAverageRating(eventId);
      res.json({ ratings, stats });
    },

    getUserRatings(req, res) {
      const userId = parseInt(req.params.userId, 10);
      const ratings = ratingRepository.findByUser(userId);
      res.json(ratings);
    },

    createRating(req, res) {
      const userId = getCurrentUser(req);
      const eventId = parseInt(req.params.eventId, 10);
      const { rating, review } = req.body;
      if (!userId) return res.status(401).json({ error: 'Missing X-User-Id header' });
      if (!rating || rating < 1 || rating > 5) {
        return res.status(422).json({ error: 'Rating must be between 1 and 5' });
      }
      const result = ratingRepository.create(eventId, userId, rating, review);
      res.json(result);
    },

    updateRating(req, res) {
      const userId = getCurrentUser(req);
      const ratingId = parseInt(req.params.ratingId, 10);
      const { rating, review } = req.body;
      if (!userId) return res.status(401).json({ error: 'Missing X-User-Id header' });
      const existing = ratingRepository.findById(ratingId);
      if (!existing || existing.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const result = ratingRepository.update(ratingId, rating, review);
      res.json(result);
    },

    deleteRating(req, res) {
      const userId = getCurrentUser(req);
      const ratingId = parseInt(req.params.ratingId, 10);
      if (!userId) return res.status(401).json({ error: 'Missing X-User-Id header' });
      const existing = ratingRepository.findById(ratingId);
      if (!existing || existing.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const deleted = ratingRepository.delete(ratingId);
      res.json({ deleted });
    },

    getEventStats(req, res) {
      const eventId = parseInt(req.params.eventId, 10);
      const stats = ratingRepository.getAverageRating(eventId);
      const distribution = ratingRepository.getRatingDistribution(eventId);
      res.json({ ...stats, distribution });
    }
  };
}

module.exports = { createRatingController };
