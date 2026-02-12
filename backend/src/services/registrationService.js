/**
 * Registration service - business rules enforcement
 * Rules: 1) Only PUBLISHED events can be registered
 *        2) Capacity cannot be exceeded
 *        3) A user cannot register twice to the same event
 *        7) Closing an event prevents new registrations
 */

const { EventStatus } = require('../domain/types');
const { NotFoundError, ConflictError, ValidationError } = require('../domain/errors');

function createRegistrationService({
  eventRepository,
  registrationRepository,
  userRepository
  , waitlistRepository, notificationService
}) {
  function getEventForRegistration(eventId) {
    const event = eventRepository.findById(eventId);
    if (!event) throw new NotFoundError('Event not found');
    if (event.status !== EventStatus.PUBLISHED) {
      throw new ValidationError('Only published events can be registered');
    }
    if (event.status === EventStatus.CLOSED) {
      throw new ValidationError('Cannot register to a closed event');
    }
    const pastDate = new Date(event.date) < new Date();
    if (pastDate) {
      throw new ValidationError('Cannot register to past events');
    }
    return event;
  }

  return {
    register(eventId, userId) {
      const event = getEventForRegistration(eventId);

      const user = userRepository.findById(userId);
      if (!user) throw new NotFoundError('User not found');

      if (event.organizerId === userId) {
        throw new ValidationError('Organizers cannot register to their own events');
      }

      if (registrationRepository.exists(eventId, userId)) {
        throw new ConflictError('User is already registered to this event');
      }

      const currentCount = registrationRepository.findByEvent(eventId).length;
      if (currentCount >= event.capacity) {
        // add to waitlist instead of failing
        if (waitlistRepository.exists(eventId, userId)) {
          throw new ConflictError('User is already on the waitlist for this event');
        }
        const wl = waitlistRepository.create(eventId, userId);
        return { waitlisted: true, position: waitlistRepository.findByEvent(eventId).length, entry: wl };
      }

      const reg = registrationRepository.create(eventId, userId);
      return reg;
    },

    unregister(eventId, userId) {
      const registrations = registrationRepository.findByEvent(eventId);
      const reg = registrations.find(r => r.userId === userId);
      if (!reg) throw new NotFoundError('Registration not found');
      registrationRepository.delete(reg.id);
      const event = eventRepository.findById(eventId);
      // If there is a waitlist, promote the first one
      const waiters = waitlistRepository.findByEvent(eventId);
      if (waiters.length > 0) {
        const next = waiters[0];
        waitlistRepository.deleteById(next.id);
        const promoted = registrationRepository.create(eventId, next.userId);
        // notify (placeholder)
        try { notificationService.notifyUser(next.userId, `You were moved from the waitlist to registered for event ${event && event.title ? event.title : eventId}`); } catch(e){}
      }
      return { deleted: true };
    },

    listByEvent(eventId) {
      const event = eventRepository.findById(eventId);
      if (!event) throw new NotFoundError('Event not found');
      return registrationRepository.findByEvent(eventId);
    },

    listWaitlistByEvent(eventId) {
      const event = eventRepository.findById(eventId);
      if (!event) throw new NotFoundError('Event not found');
      return waitlistRepository.findByEvent(eventId);
    },

    joinWaitlist(eventId, userId) {
      const event = eventRepository.findById(eventId);
      if (!event) throw new NotFoundError('Event not found');
      if (registrationRepository.exists(eventId, userId)) {
        throw new ConflictError('User is already registered to this event');
      }
      if (waitlistRepository.exists(eventId, userId)) {
        throw new ConflictError('User is already on the waitlist for this event');
      }
      const wl = waitlistRepository.create(eventId, userId);
      const pos = waitlistRepository.findByEvent(eventId).length;
      return { waitlisted: true, position: pos, entry: wl };
    },

    leaveWaitlist(eventId, userId) {
      const exists = waitlistRepository.exists(eventId, userId);
      if (!exists) throw new NotFoundError('Waitlist entry not found');
      waitlistRepository.delete(eventId, userId);
      return { left: true };
    },

    listByUser(userId, options = {}) {
      const user = userRepository.findById(userId);
      if (!user) throw new NotFoundError('User not found');

      let regs = registrationRepository.findByUser(userId);

      // If an organizerId is provided, filter registrations to events organized by that organizer
      if (options.organizerId) {
        regs = regs.filter(r => {
          const event = eventRepository.findById(r.eventId);
          return event && event.organizerId === options.organizerId;
        });
      }

      return regs;
    }
  };
}

module.exports = { createRegistrationService };
