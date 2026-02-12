/**
 * Domain-specific errors for proper HTTP status mapping
 */

class DomainError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

class NotFoundError extends DomainError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ConflictError extends DomainError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

class ForbiddenError extends DomainError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

class ValidationError extends DomainError {
  constructor(message = 'Validation failed') {
    super(message, 422);
  }
}

module.exports = {
  DomainError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
  ValidationError
};
