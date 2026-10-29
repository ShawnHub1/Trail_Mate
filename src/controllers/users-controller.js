import { db } from "../models/db.js";
import { UserSpec, UserCredentialsSpec, UserProfileSpec } from "../models/joi-schemas.js";

export const usersController = {
  index: {
    auth: false,
    handler: (request, h) => h.view("main", { title: "Trail Mate" }),
  },
  showSignup: {
    auth: false,
    handler: (request, h) => h.view("signup-view", { title: "Create a Trail Mate account" }),
  },
  signup: {
    auth: false,
    validate: {
      payload: UserSpec,
      options: { abortEarly: false },
      failAction: (request, h, error) => h.view("signup-view", {
        title: "Create a Trail Mate account", errors: error.details,
      }).takeover().code(400),
    },
    handler: async (request, h) => {
      try {
        await db.userStore.addUser(request.payload);
        return h.redirect("/login");
      } catch (error) {
        return h.view("signup-view", {
          title: "Create a Trail Mate account",
          errors: [{ message: error.message }],
        }).takeover().code(409);
      }
    },
  },
  showLogin: {
    auth: false,
    handler: (request, h) => h.view("login-view", { title: "Log in to Trail Mate" }),
  },
  login: {
    auth: false,
    validate: {
      payload: UserCredentialsSpec,
      options: { abortEarly: false },
      failAction: (request, h, error) => h.view("login-view", {
        title: "Log in to Trail Mate", errors: error.details,
      }).takeover().code(400),
    },
    handler: async (request, h) => {
      const user = await db.userStore.getUserByEmail(request.payload.email);
      const valid = await db.userStore.verifyPassword(user, request.payload.password);
      if (!valid) {
        return h.view("login-view", {
          title: "Log in to Trail Mate",
          errors: [{ message: "Email or password is incorrect." }],
        }).takeover().code(401);
      }
      request.cookieAuth.set({ id: user._id });
      return h.redirect("/dashboard");
    },
  },
  logout: {
    handler: (request, h) => {
      request.cookieAuth.clear();
      return h.redirect("/");
    },
  },
  async validate(request, session) {
    const user = await db.userStore.getUserById(session.id);
    return user ? { isValid: true, credentials: user } : { isValid: false };
  },
 showSettings: {
    handler: (request, h) => h.view("settings", { title: "Your account settings", user: request.auth.credentials }),
  },
  updateSettings: {
    validate: {
      payload: UserProfileSpec,
      options: { abortEarly: false },
      failAction: (request, h, error) => h.view("settings", {
        title: "Your account settings", user: { ...request.auth.credentials, ...request.payload }, errors: error.details,
      }).takeover().code(400),
    },
    handler: async (request, h) => {
      try {
        await db.userStore.updateUser(request.auth.credentials._id, request.payload);
        return h.redirect("/settings");
      } catch (error) {
        return h.view("settings", {
          title: "Your account settings", user: { ...request.auth.credentials, ...request.payload },
          errors: [{ message: error.code === 11000 ? "An account with that email already exists." : error.message }],
        }).takeover().code(409);
      }
    },
  },
}