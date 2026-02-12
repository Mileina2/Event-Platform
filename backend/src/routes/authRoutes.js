/**
 * Auth routes
 */

const express = require('express');

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
}

function createAuthRoutes(authController) {
  const router = express.Router();
  router.post('/login', asyncHandler((req, res) => authController.login(req, res)));
  router.post('/register', asyncHandler((req, res) => authController.register(req, res)));
  return router;
}

module.exports = { createAuthRoutes };
