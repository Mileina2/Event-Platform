/**
 * Event service - business rules enforcement
 * Rules: 4) Organizer can only edit/publish/close own events
 *        5) Capacity cannot be reduced below current registrations
 *        6) Events in the past are automatically CLOSED on read
 */

const { EventStatus, UserRole } = require('../domain/types');
const { NotFoundError, ForbiddenError, ValidationError } = require('../domain/errors');

function createEventService({ eventRepository, registrationRepository }) {
  function canOrganizerManage(event, userId, userRole) {
    if (userRole === UserRole.ADMIN) return true;
    if (userRole !== UserRole.ORGANIZER) return false;
    return event.organizerId === userId;
  }

  function ensurePastEventsClosed(event) {
    if (event.status !== EventStatus.CLOSED && new Date(event.date) < new Date()) {
      return eventRepository.update(event.id, { status: EventStatus.CLOSED });
    }
    return event;
  }

  return {
    getById(id) {
      const event = eventRepository.findById(id);
      if (!event) throw new NotFoundError('Event not found');
      return ensurePastEventsClosed(event);
    },

    list(filters = {}) {
      const events = eventRepository.findAll(filters);
      return events.map(e => ensurePastEventsClosed(e));
    },

    listByOrganizer(userId) {
      const events = eventRepository.findAll({ organizerId: userId });
      return events.map(e => ensurePastEventsClosed(e));
    },

    create(data, userId, userRole) {
      if (userRole !== UserRole.ORGANIZER && userRole !== UserRole.ADMIN) {
        throw new ForbiddenError('Only organizers can create events');
      }
      return eventRepository.create({
        ...data,
        organizerId: userId,
        status: EventStatus.DRAFT
      });
    },

    update(id, data, userId, userRole) {
      const event = eventRepository.findById(id);
      if (!event) throw new NotFoundError('Event not found');
      if (!canOrganizerManage(event, userId, userRole)) {
        throw new ForbiddenError('You can only edit your own events');
      }

      if (data.capacity !== undefined) {
        const currentRegs = registrationRepository.findByEvent(id).length;
        if (data.capacity < currentRegs) {
          throw new ValidationError(
            `Capacity cannot be reduced below current registrations (${currentRegs})`
          );
        }
      }

      return eventRepository.update(id, data);
    },

    publish(id, userId, userRole) {
      const event = eventRepository.findById(id);
      if (!event) throw new NotFoundError('Event not found');
      if (!canOrganizerManage(event, userId, userRole)) {
        throw new ForbiddenError('You can only publish your own events');
      }
      if (new Date(event.date) < new Date()) {
        throw new ValidationError('Cannot publish past events');
      }
      return eventRepository.update(id, { status: EventStatus.PUBLISHED });
    },

    close(id, userId, userRole) {
      const event = eventRepository.findById(id);
      if (!event) throw new NotFoundError('Event not found');
      if (!canOrganizerManage(event, userId, userRole)) {
        throw new ForbiddenError('You can only close your own events');
      }
      return eventRepository.update(id, { status: EventStatus.CLOSED });
    }
  };
}

module.exports = { createEventService };
