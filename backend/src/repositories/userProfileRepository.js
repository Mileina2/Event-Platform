/**
 * User Profile repository - data access for user profiles
 */

function createUserProfileRepository(db) {
  return {
    findByUserId(userId) {
      return db.prepare('SELECT * FROM user_profiles WHERE userId = ?').get(userId) || null;
    },

    findOrCreate(userId) {
      let profile = this.findByUserId(userId);
      if (!profile) {
        db.prepare('INSERT INTO user_profiles (userId) VALUES (?)').run(userId);
        profile = this.findByUserId(userId);
      }
      return profile;
    },

    update(userId, { bio, avatar, location, website }) {
      this.findOrCreate(userId); // Ensure profile exists
      const updates = [];
      const params = [];

      if (bio !== undefined) { updates.push('bio = ?'); params.push(bio); }
      if (avatar !== undefined) { updates.push('avatar = ?'); params.push(avatar); }
      if (location !== undefined) { updates.push('location = ?'); params.push(location); }
      if (website !== undefined) { updates.push('website = ?'); params.push(website); }

      if (updates.length === 0) return this.findByUserId(userId);

      updates.push("updatedAt = datetime('now')");
      params.push(userId);
      db.prepare(`UPDATE user_profiles SET ${updates.join(', ')} WHERE userId = ?`).run(...params);
      return this.findByUserId(userId);
    },

    getPublicProfile(userId) {
      const profile = this.findOrCreate(userId);
      const followerCount = db.prepare('SELECT COUNT(*) as count FROM user_following WHERE followingId = ?').get(userId).count;
      const followingCount = db.prepare('SELECT COUNT(*) as count FROM user_following WHERE followerId = ?').get(userId).count;
      return {
        ...profile,
        followerCount,
        followingCount
      };
    }
  };
}

module.exports = { createUserProfileRepository };
