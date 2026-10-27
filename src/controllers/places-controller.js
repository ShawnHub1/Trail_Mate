import { db } from "../models/db.js";

export const placesController = {
  index: {
    handler: async (request, h) => {
      const user = request.auth.credentials;
      const place = await db.placeStore.getPlaceById(request.params.id);
      if (!place || place.userId !== user._id) return h.response().code(404);
      return h.view("place", { title: place.name, place });
    },
  },
};
