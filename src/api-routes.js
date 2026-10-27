import { placeApi } from "./api/place-api.js";

export const apiRoutes = [
  { method: "GET", path: "/api/places", config: placeApi.find },
  { method: "POST", path: "/api/places", config: placeApi.create },
  { method: "GET", path: "/api/places/{id}", config: placeApi.findOne },
  { method: "PUT", path: "/api/places/{id}", config: placeApi.update },
  { method: "DELETE", path: "/api/places/{id}", config: placeApi.delete },
];
