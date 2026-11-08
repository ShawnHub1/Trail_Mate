import Boom from "@hapi/boom";
import { db } from "../models/db.js";
import { PlaceWebSpec } from "../models/joi-schemas.js";
import { imageStore } from "../models/image-store.js";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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

export const dashboardController = {
  index: {
    handler: async (request, h) => {
      const user = request.auth.credentials;
      const places = await db.placeStore.getUserPlaces(user._id);
      return h.view("dashboard", { title: "Your Trail Mate places", user, places });
    },
  },
   addPlace: {
    payload: {
      maxBytes: 5 * 1024 * 1024,
      multipart: { output: "stream" },
      parse: true,
    },
    validate: {
      payload: PlaceWebSpec,
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
      const uploadedImage = await uploadOptionalImage(request.payload.image);      
      await db.placeStore.addPlace({
        userId: user._id,
        name: request.payload.name,
        description: request.payload.description,
        difficulty: request.payload.difficulty ?? "",
        distanceKm: request.payload.distanceKm ?? null,        
        latitude: request.payload.latitude ?? null,
        longitude: request.payload.longitude ?? null,
        ...(uploadedImage ? { imageUrl: uploadedImage.url, imagePublicId: uploadedImage.publicId } : {}),

      });
      return h.redirect("/dashboard");
    },
  },
  deletePlace: {
    handler: async (request, h) => {
      const user = request.auth.credentials;
      const place = await db.placeStore.getPlaceById(request.params.id);
      const deleted = await db.placeStore.deletePlaceById(request.params.id, user._id);
      if (deleted && place?.imagePublicId) {
        try {
          await imageStore.deleteImage(place.imagePublicId);
        } catch {
          console.warn("Could not remove the deleted place's Cloudinary image.");
        }
      }
      return h.redirect("/dashboard");
    },
  },
};
