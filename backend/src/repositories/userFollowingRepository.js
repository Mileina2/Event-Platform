/**
 * User Following repository - data access for user relationships
 */

function createUserFollowingRepository(db) {
  return {
    findByFollowerAndFollowing(followerId, followingId) {
      return db.prepare('SELECT * FROM user_following WHERE followerId = ? AND followingId = ?').get(followerId, followingId) || null;
    },

    getFollowers(userId) {
      return db.prepare(`
        SELECT u.id, u.email, u.role FROM users u
        JOIN user_following uf ON u.id = uf.followerId
        WHERE uf.followingId = ?
        ORDER BY uf.createdAt DESC
      `).all(userId);
    },

    getFollowing(userId) {
      return db.prepare(`
        SELECT u.id, u.email, u.role FROM users u
        JOIN user_following uf ON u.id = uf.followingId
        WHERE uf.followerId = ?
        ORDER BY uf.createdAt DESC
      `).all(userId);
    },

    follow(followerId, followingId) {
      if (followerId === followingId) {
        throw new Error('Cannot follow yourself');
      }
      try {
        db.prepare('INSERT INTO user_following (followerId, followingId) VALUES (?, ?)').run(followerId, followingId);
        return true;
      } catch (_) {
        return false; // Already following
      }
    },

    unfollow(followerId, followingId) {
      const result = db.prepare('DELETE FROM user_following WHERE followerId = ? AND followingId = ?').run(followerId, followingId);
      return result.changes > 0;
    },

    isFollowing(followerId, followingId) {
      const follow = this.findByFollowerAndFollowing(followerId, followingId);
      return !!follow;
    },

    getFollowerCount(userId) {
      const row = db.prepare('SELECT COUNT(*) as count FROM user_following WHERE followingId = ?').get(userId);
      return row.count;
    },

    getFollowingCount(userId) {
      const row = db.prepare('SELECT COUNT(*) as count FROM user_following WHERE followerId = ?').get(userId);
      return row.count;
    }
  };
}

module.exports = { createUserFollowingRepository };
