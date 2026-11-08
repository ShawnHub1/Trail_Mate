# Trail Mate

## Project map

Project map to be added later.

## Trail Mate app details

Trail Mate is a web app for saving trails and hikes. You can add a name, an optional description, difficulty, distance, and coordinates.

## Setup

Requirements: Node.js, npm, and MongoDB Community Server running locally. MongoDB Compass is optional and provides a desktop interface for inspecting the database.

1. Copy `.env.example` to `.env`.
2. Set `COOKIE_PASSWORD` to a private random value of at least 32 characters.
3. Install dependencies with `npm install`.
4. Install and start MongoDB Community Server. The default connection string is `mongodb://127.0.0.1:27017/trail_mate`; use the same URI in MongoDB Compass to inspect the app's data.
5. Start the app with `npm run dev` and open `http://localhost:3000`.

The app uses MongoDB whenever `DATABASE_URL` is set. Users and places are stored in the `trail_mate` database, in the `users` and `places` collections, and persist across restarts. If `DATABASE_URL` is missing, the app warns and uses temporary in-memory storage instead. Set `DATABASE_URL` to a MongoDB Atlas connection string later to switch to Atlas.

## Features

- Sign up, log in, and log out with an authenticated cookie session.
- Passwords are stored as salted scrypt hashes.
- Add, view, edit, and remove your personal places.
- Place fields include name, description, difficulty, distance in kilometres, and an optional latitude/longitude pair.
- Coordinates are numeric; latitude must be between -90 and 90, and longitude between -180 and 180. Place detail pages link to OpenStreetMap when coordinates are present.
- Edit forms validate place data and show errors while preserving submitted values.
- Place pages and edit actions are scoped to the signed-in account. Attempts to view or edit another user's place return 404.
- Update your own first name, last name, and email at `/settings`. The session remains active after a profile update.

## JSON API

All endpoints require the signed-in cookie session. Send and receive JSON for API requests unless noted. Place responses never include account passwords.

| Method | Path | Input | Success response |
| --- | --- | --- | --- |
| `GET` | `/api/places` | — | `200`, current user's place array |
| `POST` | `/api/places` | `{ "name": "Glendalough Spinc", "description": "A scenic loop", "latitude": 53.0109, "longitude": -6.3275 }` | `201`, created place |
| `GET` | `/api/places/{id}` | — | `200`, place object |
| `GET` | `/api/places/{id}.json` | — | `200`, pretty-printed JSON document (`application/json`) |
| `PUT` | `/api/places/{id}` | Any non-empty subset of `name`, `description`, `difficulty`, `distanceKm`, `latitude`, and `longitude` | `200`, updated place |
| `DELETE` | `/api/places/{id}` | — | `204` |
| `GET` | `/api/users/me` | — | `200`, current user's public profile |
| `PUT` | `/api/users/me` | `{ "firstName": "Maggie", "lastName": "Simpson", "email": "maggie@example.com" }` | `200`, updated public profile |

Place `name` is required on creation and must be 1–100 characters. `description` is optional and has a 2,000 character maximum. Coordinates are optional but must be supplied together. Profile updates accept only `firstName`, `lastName`, and `email`; account IDs and password fields cannot be changed through this endpoint. Attempts to read or change another user's place return `404`. Invalid input returns `400`; duplicate email addresses return `409`; unauthenticated requests are redirected to `/login` by the cookie strategy.

## HTML routes

- `GET /signup` and `GET /login` show the account forms.
- `POST /register` and `POST /authenticate` create an account and sign in.
- `POST /logout` signs out.
- `GET /dashboard` lists the signed-in user's places; `POST /dashboard/places` adds a place.
- `GET /place/{id}` shows an owned place.
- `GET /dashboard/places/{id}/edit` shows the edit form; `POST` to the same path validates and saves changes for the owner.
- `POST /dashboard/places/{id}/delete` removes an owned place.
- `GET /settings` and `POST /settings` show and update the signed-in user's profile.

## Tests

Run the Mocha suite with:

```sh
npm test
```

Run lint with:

```sh
npm run lint
```

The tests cover account creation and password verification, profile updates, place CRUD and ownership, API validation and JSON rendering, and web edit controller behavior including valid updates, invalid submissions, and owner-only access.

## Deployment

Set `COOKIE_PASSWORD` to a unique secret of at least 32 characters. Set `NODE_ENV=production` behind HTTPS to enable secure cookies. `PORT` and `HOST` can be set for the hosting environment. `DATABASE_URL` may point to a local MongoDB server or MongoDB Atlas.
