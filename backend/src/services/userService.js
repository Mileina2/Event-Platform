/**
 * User service - simple read operations for now
 */

const { NotFoundError } = require('../domain/errors');

function createUserService({ userRepository }) {
  return {
    getById(id) {
      const user = userRepository.findById(id);
      if (!user) throw new NotFoundError('User not found');
      return userRepository.toPublic(user);
    },

    getByEmail(email) {
      const user = userRepository.findByEmail(email);
      if (!user) throw new NotFoundError('User not found');
      return userRepository.toPublic(user);
    },

    list() {
      return userRepository.findAll();
    }
  };
}

module.exports = { createUserService };
