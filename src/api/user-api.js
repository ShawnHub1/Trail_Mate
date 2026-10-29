import Boom from "@hapi/boom";
import { db } from "../models/db.js";
import { UserProfileSpec } from "../models/joi-schemas.js";

export const userApi = {
  findMe: { handler: (request) => db.userStore.getUserById(request.auth.credentials._id) },
  updateMe: {
    validate: { payload: UserProfileSpec },
    handler: async (request) => {
      try {
        const user = await db.userStore.updateUser(request.auth.credentials._id, request.payload);
        if (!user) return Boom.notFound("User not found");
        return user;
      } catch (error) {
        if (error.code === 11000 || error.message.includes("already exists")) return Boom.conflict("An account with that email already exists.");
        throw error;
      }
    },
  },
};
