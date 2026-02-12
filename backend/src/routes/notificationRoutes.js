const express = require('express');

module.exports = function createNotificationRoutes(notificationService) {
  const router = express.Router();

  // SSE subscribe: client should send X-User-Id header or ?userId=
  router.get('/subscribe', (req, res) => notificationService.subscribe(req, res));

  router.get('/health', (req, res) => res.json({ status: 'ok' }));

  return router;
};
