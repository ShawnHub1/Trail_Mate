import { placeApi } from "./api/place-api.js";
import { userApi } from "./api/user-api.js";

export const apiRoutes = [
  { method: "GET", path: "/api/places", config: placeApi.find },
  { method: "GET", path: "/api/users/me", config: userApi.findMe },
  { method: "PUT", path: "/api/users/me", config: userApi.updateMe },
  { method: "POST", path: "/api/places", config: placeApi.create },
  { method: "GET", path: "/api/places/{id}", config: placeApi.findOne },
  { method: "GET", path: "/api/places/{id}.json", config: placeApi.renderJson },
  { method: "PUT", path: "/api/places/{id}", config: placeApi.update },
  { method: "DELETE", path: "/api/places/{id}", config: placeApi.delete },
];
