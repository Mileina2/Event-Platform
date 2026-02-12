/**
 * User routes
 */

const express = require('express');

function createUserRoutes(userController) {
  const router = express.Router();
  router.get('/', (req, res) => userController.list(req, res));
  router.get('/:id', (req, res) => userController.getById(req, res));
  return router;
}

module.exports = { createUserRoutes };
