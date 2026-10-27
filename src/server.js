import Hapi from "@hapi/hapi";
import Joi from "joi";
import Vision from "@hapi/vision";
import dotenv from "dotenv";
import Handlebars from "handlebars";
import path from "path";
import { fileURLToPath } from "url";
import Cookie from "@hapi/cookie";
import { apiRoutes } from "./api-routes.js";
import { webRoutes } from "./web-routes.js";
import { usersController } from "./controllers/users-controller.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function init() {
  const server = Hapi.server({ port: Number(process.env.PORT) || 3000, host: process.env.HOST || "localhost" });
  await server.register(Vision);
  await server.register(Cookie);
  server.validator(Joi);
  server.auth.strategy("session", "cookie", {
    cookie: {
      name: process.env.COOKIE_NAME || "trailmate",
      password: process.env.COOKIE_PASSWORD,
      isSecure: process.env.NODE_ENV === "production",
      path: "/",
    },
    redirectTo: "/login",
    validate: usersController.validate,
  });
  server.auth.default("session");
  server.views({
    engines: { hbs: Handlebars },
    relativeTo: __dirname,
    path: "./views",
    layoutPath: "./views/layouts",
    partialsPath: "./views/partials",
    layout: true,
    isCached: false,
  });
  server.route(webRoutes);
  server.route(apiRoutes);
  await server.start();
  console.log("Server running on %s", server.info.uri);
}

init();
