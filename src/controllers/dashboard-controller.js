import { db } from "../models/db.js";
import { PlaceSpec } from "../models/joi-schemas.js";

export const dashboardController = {
  index: {
    handler: async (request, h) => {
      const user = request.auth.credentials;
      const places = await db.placeStore.getUserPlaces(user._id);
      return h.view("dashboard", { title: "Your Trail Mate places", user, places });
    },
  },
  addPlace: {
    validate: {
      payload: PlaceSpec,
      options: { abortEarly: false },
      failAction: async (request, h, error) => {
        const user = request.auth.credentials;
        const places = await db.placeStore.getUserPlaces(user._id);
        return h.view("dashboard", {
          title: "Your Trail Mate places", user, places, errors: error.details,
        }).takeover().code(400);
      },
    },
    handler: async (request, h) => {
      const user = request.auth.credentials;
      await db.placeStore.addPlace({
        userId: user._id,
        name: request.payload.name,
        description: request.payload.description,
        latitude: request.payload.latitude ?? null,
        longitude: request.payload.longitude ?? null,
      });
      return h.redirect("/dashboard");
    },
  },
  deletePlace: {
    handler: async (request, h) => {
      const user = request.auth.credentials;
      await db.placeStore.deletePlaceById(request.params.id, user._id);
      return h.redirect("/dashboard");
    },
  },
};
