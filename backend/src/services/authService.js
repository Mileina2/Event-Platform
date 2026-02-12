/**
 * Auth service - login & register
 */

const bcrypt = require('bcryptjs');
const { ConflictError, ValidationError } = require('../domain/errors');
const { UserRole } = require('../domain/types');

function createAuthService({ userRepository }) {
  return {
    async login(email, password) {
      if (!email?.trim() || !password) {
        throw new ValidationError('Email et mot de passe requis');
      }
      const user = userRepository.findByEmail(email.trim().toLowerCase());
      if (!user || !user.passwordHash) {
        throw new ValidationError('Email ou mot de passe incorrect');
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        throw new ValidationError('Email ou mot de passe incorrect');
      }
      return userRepository.toPublic(user);
    },

    async register(email, password, role = UserRole.USER) {
      if (!email?.trim() || !password) {
        throw new ValidationError('Email et mot de passe requis');
      }
      if (password.length < 6) {
        throw new ValidationError('Le mot de passe doit contenir au moins 6 caractères');
      }
      const normalizedEmail = email.trim().toLowerCase();
      if (userRepository.findByEmail(normalizedEmail)) {
        throw new ConflictError('Un compte existe déjà avec cet email');
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = userRepository.create({
        email: normalizedEmail,
        passwordHash,
        role
      });
      return userRepository.toPublic(user);
    }
  };
}

module.exports = { createAuthService };
