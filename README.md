# Event Management Platform MVP

Domain-driven Event Management Platform with Node.js backend and Angular frontend.

## Stack

- **Backend:** Node.js, Express, SQLite (no ORM)
- **Frontend:** Angular SPA (standalone components, router)
- **Communication:** REST JSON

## Quick Start

### 1. Backend (terminal 1)

```bash
cd backend
npm install
npm start       # Runs on http://localhost:3000 - auto-seeds DB if empty
```

### 2. Frontend (terminal 2)

```bash
cd frontend
npm install
npm start       # Runs on http://localhost:4200 (proxies /api to backend)
```

Ouvrez http://localhost:4200 → connectez-vous ou créez un compte.

**Comptes de démo** (après seed) : `admin@events.com`, `user1@events.com`, etc. — mot de passe : `password123`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/users | List users |
| GET | /api/users/:id | Get user |
| GET | /api/events | List events (optional ?status=) |
| GET | /api/events/:id | Get event |
| POST | /api/events | Create event (needs X-User-Id) |
| PATCH | /api/events/:id | Update event (organizer only) |
| POST | /api/events/:id/publish | Publish event (organizer only) |
| POST | /api/events/:id/close | Close event (organizer only) |
| POST | /api/events/:eventId/register | Register to event (needs X-User-Id) |
| DELETE | /api/events/:eventId/register | Unregister (needs X-User-Id) |
| GET | /api/events/:eventId/registrations | List event registrations |
| GET | /api/users/:userId/registrations | List user registrations |

## Business Rules

1. Only PUBLISHED events can be registered
2. Capacity cannot be exceeded
3. A user cannot register twice to the same event
4. Organizer can only edit/publish/close own events (role ORGANIZER)
5. Capacity cannot be reduced below current registrations
6. Events in the past are automatically CLOSED on read
7. Closing an event prevents new registrations

## Folder Structure

```
backend/
  src/
    domain/       # types, errors
    db/           # SQLite init, seed
    repositories/ # data access
    services/     # business rules
    controllers/  # HTTP handling
    routes/
    index.js

frontend/
  src/app/
    models/
    services/
    components/
```
