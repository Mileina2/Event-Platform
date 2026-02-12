/**
 * User Profile controller - HTTP handling for user profiles and following
 */

function createUserProfileController(userProfileRepository, userFollowingRepository) {
  const getCurrentUser = (req) => {
    const id = req.headers['x-user-id'];
    if (!id) return null;
    return parseInt(id, 10);
  };

  return {
    getProfile(req, res) {
      const userId = parseInt(req.params.userId, 10);
      const profile = userProfileRepository.getPublicProfile(userId);
      res.json(profile);
    },

    updateProfile(req, res) {
      const userId = getCurrentUser(req);
      if (!userId) return res.status(401).json({ error: 'Missing X-User-Id header' });
      if (userId !== parseInt(req.params.userId, 10)) {
        return res.status(403).json({ error: 'Cannot update other users profile' });
      }
      const profile = userProfileRepository.update(userId, req.body);
      res.json(profile);
    },

    getFollowers(req, res) {
      const userId = parseInt(req.params.userId, 10);
      const followers = userFollowingRepository.getFollowers(userId);
      res.json(followers);
    },

    getFollowing(req, res) {
      const userId = parseInt(req.params.userId, 10);
      const following = userFollowingRepository.getFollowing(userId);
      res.json(following);
    },

    follow(req, res) {
      const followerId = getCurrentUser(req);
      const followingId = parseInt(req.params.userId, 10);
      if (!followerId) return res.status(401).json({ error: 'Missing X-User-Id header' });
      try {
        const success = userFollowingRepository.follow(followerId, followingId);
        res.json({ success });
      } catch (err) {
        res.status(422).json({ error: err.message });
      }
    },

    unfollow(req, res) {
      const followerId = getCurrentUser(req);
      const followingId = parseInt(req.params.userId, 10);
      if (!followerId) return res.status(401).json({ error: 'Missing X-User-Id header' });
      const success = userFollowingRepository.unfollow(followerId, followingId);
      res.json({ success });
    },

    checkFollowing(req, res) {
      const followerId = getCurrentUser(req);
      const followingId = parseInt(req.params.userId, 10);
      if (!followerId) return res.json({ isFollowing: false });
      const isFollowing = userFollowingRepository.isFollowing(followerId, followingId);
      res.json({ isFollowing });
    }
  };
}

module.exports = { createUserProfileController };
