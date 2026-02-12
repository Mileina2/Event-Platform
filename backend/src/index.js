/**
 * Event Management Platform API - Entry point
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { initDb } = require('./db/init');
const { seedDatabase } = require('./db/seed');
const { createUserRepository } = require('./repositories/userRepository');
const { createAuthService } = require('./services/authService');
const { createAuthController } = require('./controllers/authController');
const { createAuthRoutes } = require('./routes/authRoutes');
const { createEventRepository } = require('./repositories/eventRepository');
const { createRegistrationRepository } = require('./repositories/registrationRepository');
const { createUserService } = require('./services/userService');
const { createEventService } = require('./services/eventService');
const { createRegistrationService } = require('./services/registrationService');
const { createUserController } = require('./controllers/userController');
const { createEventController } = require('./controllers/eventController');
const { createRegistrationController } = require('./controllers/registrationController');
const { createUserRoutes } = require('./routes/userRoutes');
const { createEventRoutes } = require('./routes/eventRoutes');
const { createRegistrationRoutes } = require('./routes/registrationRoutes');
const { DomainError } = require('./domain/errors');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
try {
  const db = initDb();
  if (seedDatabase(db)) {
    console.log('Database auto-seeded with sample data');
  }

  const userRepository = createUserRepository(db);
const eventRepository = createEventRepository(db);
const registrationRepository = createRegistrationRepository(db);
const waitlistRepository = require('./repositories/waitlistRepository').createWaitlistRepository(db);
const tagRepository = require('./repositories/tagRepository').createTagRepository(db);
const favoriteRepository = require('./repositories/favoriteRepository').createFavoriteRepository(db);
const ratingRepository = require('./repositories/ratingRepository').createRatingRepository(db);
const userProfileRepository = require('./repositories/userProfileRepository').createUserProfileRepository(db);
const userFollowingRepository = require('./repositories/userFollowingRepository').createUserFollowingRepository(db);

  const userService = createUserService({ userRepository });
  const eventService = createEventService({ eventRepository, registrationRepository });
  const notificationService = require('./services/notificationService').createNotificationService();
  const auditService = require('./services/auditService').createAuditService({ dataDir });

  const registrationService = createRegistrationService({
    eventRepository,
    registrationRepository,
    userRepository,
    waitlistRepository,
    notificationService
  });

  const authService = createAuthService({ userRepository });
  const userController = createUserController(userService);
  const authController = createAuthController(authService);
  const eventController = createEventController(eventService);
  const registrationController = createRegistrationController(registrationService);

  const tagController = require('./controllers/tagController').createTagController(tagRepository);
  const favoriteController = require('./controllers/favoriteController').createFavoriteController(favoriteRepository);
  const ratingController = require('./controllers/ratingController').createRatingController(ratingRepository);
  const userProfileController = require('./controllers/userProfileController').createUserProfileController(userProfileRepository, userFollowingRepository);

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Audit middleware: intercept explicit 403 status usage via res.status(403)
  app.use((req, res, next) => {
    const originalStatus = res.status.bind(res);
    res.status = function(code) {
      if (code === 403) {
        try { auditService.logForbidden({ req, reason: 'Response set to 403' }); } catch (e) {}
      }
      return originalStatus(code);
    };
    next();
  });

  // Mount notifications route (SSE)
  app.use('/api/notifications', require('./routes/notificationRoutes')(notificationService));

  app.use('/api/auth', createAuthRoutes(authController));
  app.use('/api/users', createUserRoutes(userController));
  app.use('/api/users', require('./routes/userProfileRoutes').createUserProfileRoutes(userProfileController));
  app.use('/api/tags', require('./routes/tagRoutes').createTagRoutes(tagController));
  app.use('/api/favorites', require('./routes/favoriteRoutes').createFavoriteRoutes(favoriteController));
  app.use('/api/ratings', require('./routes/ratingRoutes').createRatingRoutes(ratingController));
  app.use('/api/events', createEventRoutes(eventController));
  app.use('/api', createRegistrationRoutes(registrationController));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use((err, req, res, next) => {
    if (err instanceof DomainError) {
      // Audit Forbidden domain errors
      if (err.statusCode === 403) {
        try { auditService.logForbidden({ req, reason: err.message }); } catch (e) {}
      }
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
    console.log('Endpoints: /api/users, /api/events, /api/events/:id/register, etc.');
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Another process is listening on this port.`);
      console.error('If you want to free the port, terminate the process using it or set a different PORT environment variable.');
      process.exit(1);
    }
    console.error('Server error:', err && err.stack ? err.stack : err);
    process.exit(1);
  });
} catch (err) {
  console.error('Failed to start server:', err && err.stack ? err.stack : err);
  process.exit(1);
}
