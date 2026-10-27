import Boom from "@hapi/boom";
import { db } from "../models/db.js";
import { PlaceSpec } from "../models/joi-schemas.js";

export const placeApi = {
  find: {
    handler: async (request) => db.placeStore.getUserPlaces(request.auth.credentials._id),
  },
  findOne: {
    handler: async (request) => {
      const place = await db.placeStore.getPlaceById(request.params.id);
      if (!place || place.userId !== request.auth.credentials._id) return Boom.notFound("Place not found");
      return place;
    },
  },
  create: {
    validate: { payload: PlaceSpec },
    handler: async (request, h) => {
      const place = await db.placeStore.addPlace({
        userId: request.auth.credentials._id,
        name: request.payload.name,
      });
      return h.response(place).code(201);
    },
  },
  update: {
    validate: { payload: PlaceSpec },
    handler: async (request) => {
      const place = await db.placeStore.getPlaceById(request.params.id);
      if (!place || place.userId !== request.auth.credentials._id) return Boom.notFound("Place not found");
      return db.placeStore.updatePlace(place._id, { name: request.payload.name }, place.userId);
    },
  },
  delete: {
    handler: async (request, h) => {
      const deleted = await db.placeStore.deletePlaceById(request.params.id, request.auth.credentials._id);
      if (!deleted) return Boom.notFound("Place not found");
      return h.response().code(204);
    },
  },
};
