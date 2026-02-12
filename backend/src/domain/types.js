/**
 * Domain types and constants
 */

const UserRole = Object.freeze({
  USER: 'USER',
  ORGANIZER: 'ORGANIZER',
  ADMIN: 'ADMIN'
});

const EventStatus = Object.freeze({
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED'
});

module.exports = {
  UserRole,
  EventStatus
};
