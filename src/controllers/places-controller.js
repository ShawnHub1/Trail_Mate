import { db } from "../models/db.js";
import { TRAIL_DIFFICULTIES } from "../models/trail-options.js";
import { PlaceSpec } from "../models/joi-schemas.js";

async function getOwnedPlace(id, userId) {
  const place = await db.placeStore.getPlaceById(id);
  if (!place || String(place.userId) !== String(userId)) return null;
  return place;
}

function difficultyOptions(selected) {
  return ["", ...TRAIL_DIFFICULTIES].map((value) => ({
    value,
    label: value || "Choose a difficulty",
    selected: value === (selected ?? ""),
  }));
}

function editViewData(place, form = place) {
  return {
    title: `Edit ${place.name}`,
    place,
    form,
    difficultyOptions: difficultyOptions(form.difficulty),
  };
}

export const placesController = {
  index: {
    handler: async (request, h) => {
      const user = request.auth.credentials;
      const place = await db.placeStore.getPlaceById(request.params.id);
      if (!place || String(place.userId) !== String(user._id)) return h.response().code(404);
      return h.view("place", { title: place.name, place });
    },
  },
  edit: {
    handler: async (request, h) => {
      const place = await getOwnedPlace(request.params.id, request.auth.credentials._id);
      if (!place) return h.response().code(404);
      return h.view("edit-place", editViewData(place));
    },
  },
  update: {
    validate: {
      payload: PlaceSpec,
      options: { abortEarly: false },
      failAction: async (request, h, error) => {
        const place = await getOwnedPlace(request.params.id, request.auth.credentials._id);
        if (!place) return h.response().code(404).takeover();
        return h.view("edit-place", {
          ...editViewData(place, request.payload),
          errors: error.details,
        }).takeover().code(400);
      },
    },
    handler: async (request, h) => {
      const user = request.auth.credentials;
      const updated = await db.placeStore.updatePlace(request.params.id, {
        name: request.payload.name,
        description: request.payload.description ?? "",
        difficulty: request.payload.difficulty ?? "",
        distanceKm: request.payload.distanceKm ?? null,
        latitude: request.payload.latitude ?? null,
        longitude: request.payload.longitude ?? null,
      }, user._id);
      if (!updated) return h.response().code(404);
      return h.redirect(`/place/${updated._id}`);
    },
  },
};
