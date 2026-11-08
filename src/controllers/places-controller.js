import Boom from "@hapi/boom";
import { db } from "../models/db.js";
import { TRAIL_DIFFICULTIES } from "../models/trail-options.js";
import { PlaceWebSpec } from "../models/joi-schemas.js";
import { imageStore } from "../models/image-store.js";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function getOwnedPlace(id, userId) {
  const place = await db.placeStore.getPlaceById(id);
  if (!place || String(place.userId) !== String(userId)) return null;
  return place;
}

async function uploadOptionalImage(file) {
  if (!file?.hapi?.filename) return null;
  const contentType = file.hapi.headers["content-type"];
  if (!IMAGE_TYPES.has(contentType)) {
    throw Boom.badRequest("Upload a JPEG, PNG, or WebP image.");
  }
  if (!imageStore.isConfigured()) {
    throw Boom.serverUnavailable("Photo uploads are not configured yet.");
  }
  try {
    return await imageStore.uploadImage(file);
  } catch {
    throw Boom.serverUnavailable("The photo could not be uploaded. Please try again.");
  }
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
      const place = await getOwnedPlace(request.params.id, user._id);
      if (!place) return h.response().code(404);
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
    payload: {
      maxBytes: 5 * 1024 * 1024,
      multipart: { output: "stream" },
      parse: true,
    },
    validate: {
      payload: PlaceWebSpec,
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
      const place = await getOwnedPlace(request.params.id, user._id);
      if (!place) return h.response().code(404);
      const uploadedImage = await uploadOptionalImage(request.payload.image);
      const changes = {
        name: request.payload.name,
        description: request.payload.description ?? "",
        difficulty: request.payload.difficulty ?? "",
        distanceKm: request.payload.distanceKm ?? null,
        latitude: request.payload.latitude ?? null,
        longitude: request.payload.longitude ?? null,
      };
      if (uploadedImage) {
        changes.imageUrl = uploadedImage.url;
        changes.imagePublicId = uploadedImage.publicId;
      }
      const updated = await db.placeStore.updatePlace(request.params.id, changes, user._id);
      if (!updated) return h.response().code(404);
      if (uploadedImage && place.imagePublicId) {
        try {
          await imageStore.deleteImage(place.imagePublicId);
        } catch {
          console.warn("Could not remove the replaced Cloudinary image.");
        }
      }
      return h.redirect(`/place/${updated._id}`);
    },
  },
};
