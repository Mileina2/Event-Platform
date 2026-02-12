/**
 * User Profile routes
 */

const express = require('express');

function createUserProfileRoutes(userProfileController) {
  const router = express.Router();
  
  router.get('/:userId/profile', (req, res) => userProfileController.getProfile(req, res));
  router.patch('/:userId/profile', (req, res) => userProfileController.updateProfile(req, res));
  router.get('/:userId/followers', (req, res) => userProfileController.getFollowers(req, res));
  router.get('/:userId/following', (req, res) => userProfileController.getFollowing(req, res));
  router.post('/:userId/follow', (req, res) => userProfileController.follow(req, res));
  router.delete('/:userId/follow', (req, res) => userProfileController.unfollow(req, res));
  router.get('/:userId/follow/check', (req, res) => userProfileController.checkFollowing(req, res));

  return router;
}

module.exports = { createUserProfileRoutes };
