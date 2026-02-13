# Plateforme de gestion d'événements — MVP

> **Module** : Web Application Architectures
> 
> **Enseignant référent** :  NAUWYNCK Arnaud
> 
> **Auteurs** :  **Yobe GNADAME,  Mileina MALOU, Jean-Eudes WANDJI**
> 
> **Promotion** :  ESILV M1 2025-2026


## Description du Projet

Ceci est une petite application pour créer, publier et gérer des événements.
L'objectif ici est simple : permettre à des organisateurs de publier des événements, et aux participants de s'y inscrire (avec gestion de liste d'attente).


## Stack

- Backend : Node.js + Express, SQLite (fichiers locaux)
- Frontend : Angular (SPA, composants standalone)
- Auth (dev) : en-têtes `X-User-Id` et `X-User-Role`


## Démarrage rapide

1) Backend

```powershell
cd backend
npm install
npm start    # écoute sur http://localhost:3000
```

2) Frontend

```powershell
cd frontend
npm install
npm start    # lance l'app Angular (http://localhost:4200 par défaut)
```

Ensuite, ouvrez votre navigateur sur l'URL indiquée et connectez-vous.

Comptes de démonstration (si la base a été seedée) :
- `admin@events.com`, `user1@events.com`, mot de passe : `password123`



## Ce qui a changé récemment

- J'ai retiré la fonctionnalité d'export (CSV/PDF/iCal) : elle n'était pas utile pour votre flux.
- Ajout d'un petit service de notifications en temps réel (Server-Sent Events) :
  - Endpoint : `/api/notifications/subscribe` (utiliser `X-User-Id` en header, ou `?userId=` si EventSource ne permet pas d'envoyer des headers).
  - Utilité : notifications comme la promotion d'un utilisateur depuis la liste d'attente.
- Audit des accès refusés (403) : les tentatives interdites sont consignées dans `data/audit.log`.



## Utilisation rapide des notifications (exemple)

Si vous voulez voir les notifications côté client dans la console du navigateur :

```js
// Si votre navigateur peut ajouter des headers sur EventSource, envoyez X-User-Id
const evt = new EventSource('/api/notifications/subscribe?userId=3');
evt.onmessage = e => console.log('notification', e.data);
```



## Points importants / règles métier

- Seuls les événements en `PUBLISHED` acceptent des inscriptions.
- La capacité est respectée ; quand c'est plein, on rejoint la liste d'attente.
- Si quelqu'un se désinscrit, la première personne de la liste d'attente est promue automatiquement.
- Les organisateurs ne peuvent pas s'inscrire à leurs propres événements.
- Les actions d'édition/publication/fermeture sont réservées à l'organisateur propriétaire de l'événement.



## Endpoints utiles

- `GET /api/health` — état du service
- `GET /api/events` — liste des événements (filtres disponibles)
- `GET /api/events/:id` — détail
- `POST /api/events` — créer (organisateur)
- `POST /api/events/:id/publish` — publier (organisateur)
- `POST /api/events/:id/close` — fermer (organisateur)
- `POST /api/events/:eventId/register` — s'inscrire (header `X-User-Id` requis)
- `DELETE /api/events/:eventId/register` — se désinscrire
- `GET /api/events/:eventId/registrations` — voir inscrits (organisateur)
- `GET /api/users/:userId/registrations` — voir ses inscriptions (ou pour organisateur filtré)
- `GET /api/notifications/subscribe` — SSE subscribe



## Où regarder en cas de problème

- Logs serveur : console où vous lancez `npm start` dans `backend`
- Audit 403 : `data/audit.log`
- DB : fichier SQLite dans `backend/data`


Si tu veux que j'adapte le README en anglais, que je le réduise encore, ou que j'ajoute un petit guide pour déployer, dis-moi lequel — je le fais rapidement et sans « style IA ». 
