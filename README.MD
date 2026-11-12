# Trail Mate

Trail Mate is a small web app for saving trails and hikes. You can add a name, an optional description, difficulty, distance, A picture and coordinates.
When coordinates are saved, you can open the place in OpenStreetMap 

## What you need

- Node.js and npm
- A MongoDB database: local MongoDB for development, or MongoDB Atlas for hosted use
- MongoDB Compass 

## Set up and run

1. Copy `.env.example` to `.env`:

   ```sh
   cp .env.example .env
   ```

2. Open `.env` and replace the `COOKIE_PASSWORD` placeholder with a private random value at least 32 characters long. Keep `.env` private; it is not meant to be committed or shared.
3. For local development, the example `DATABASE_URL` connects to `trail_mate` on your computer. You can instead use an Atlas connection string; keep credentials private and do not commit `.env`.
4. Install the project packages and start the app:

   ```sh
   npm install
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000), create an account, and add a place.

## API documentation

Open `/documentation` for Swagger UI or `/swagger.json` for the generated Swagger 2.0 description. `hapi-swagger` builds both from the Hapi route definitions and Joi schemas. Sign in to Trail Mate in the same browser first so the session cookie is sent with API requests from Swagger UI.

## View data in Compass

For the local development database, connect Compass to:

```text
mongodb://127.0.0.1:27017/trail_mate
```

The app saves accounts in the `users` collection and places in the `places` collection. MongoDB creates these after the app first saves data.

For Atlas, use the same Atlas connection string configured as `DATABASE_URL` in the app. The database name is the path after the cluster hostname in the URI, for example `/trail_mate`; the `users` and `places` collections appear in that database after their first records are saved.

## Production database: MongoDB Atlas

The deployed web app uses MongoDB Atlas through the `DATABASE_URL` environment variable. In Atlas, create a database user, allow the Render service to connect through Atlas Network Access, and copy the application connection string. Add a database name after the cluster hostname, such as `/trail_mate`, and URL-encode any reserved characters in the username or password.

Set `DATABASE_URL` in the Render service's Environment settings. Do not put the connection string in source code, the README, or a committed `.env` file. The app selects its MongoDB stores at startup when `DATABASE_URL` is present; without it, the app falls back to temporary in-memory storage.

## Render deployment

The production web service is hosted on Render:

- **Live app:** [https://trail-mate-production.onrender.com](https://trail-mate-production.onrender.com)
- **Build command:** `npm install`
- **Start command:** `npm start`

Configure these environment variables in the Render service settings:

- `DATABASE_URL` — the private MongoDB Atlas connection string, including the intended database name
- `COOKIE_PASSWORD` — a private random value of at least 32 characters
- `COOKIE_NAME` — for example, `trailmate`
- `HOST` — `0.0.0.0`, so Render can reach the web server

Render supplies the `PORT` value; the app should listen on that port. Never commit production credentials. After pushing a change to the connected branch, Render builds and deploys that revision.

## How places work

Only the place name is required. Description, difficulty, distance in kilometres, and coordinates are optional. Choose Easy, Moderate, or Hard for difficulty. Coordinates must be entered as a latitude and longitude pair. The place list and detail page show difficulty and distance; the detail page also offers an OpenStreetMap link when coordinates are present.

When `DATABASE_URL` is set, accounts and places persist in MongoDB across app restarts. Without it, the app uses temporary in-memory storage. Data from the in-memory store is not copied into MongoDB automatically.

## Useful commands

```sh
npm run dev  # Start the app with automatic reloads
npm start    # Start the app
npm test     # Run the automated tests
npm run lint # Check JavaScript style
```