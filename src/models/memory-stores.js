import { randomUUID } from "node:crypto";
import { hashPassword, verifyPassword } from "./passwords.js";

const users = new Map();
const places = new Map();

function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

export const userStore = {
  async getAllUsers() { return [...users.values()].map(publicUser); },
  async getUserById(id) { return users.has(id) ? publicUser(users.get(id)) : null; },
  async getUserByEmail(email) {
    return [...users.values()].find((item) => item.email === email.trim().toLowerCase()) ?? null;
  },
  async addUser(input) {
    const email = input.email.trim().toLowerCase();
    if ([...users.values()].some((user) => user.email === email)) {
      throw new Error("An account with that email already exists.");
    }
    const user = {
      _id: randomUUID(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email,
      password: await hashPassword(input.password),
    };
    users.set(user._id, user);
    return publicUser(user);
  },

  async updateUser(id, changes) {
    const user = users.get(id);
    if (!user) return null;
    const email = changes.email.trim().toLowerCase();
    if ([...users.values()].some((candidate) => candidate._id !== id && candidate.email === email)) {
      throw new Error("An account with that email already exists.");
    }
    Object.assign(user, { ...changes, email });
    return publicUser(user);
  },
  async verifyPassword(user, password) { return verifyPassword(user?.password, password); },
  async deleteAll() { users.clear(); },
};

export const placeStore = {
  async getAllPlaces() { return [...places.values()]; },
  async getUserPlaces(userId) { return [...places.values()].filter((place) => place.userId === userId); },
  async getPlaceById(id) { return places.get(id) ?? null; },
  async addPlace(place) {
    const saved = { _id: randomUUID(), ...place };
    places.set(saved._id, saved);
    return saved;
  },
  async getPlaceJson(id, userId) {
    const place = places.get(id);
    if (!place || place.userId !== userId) return null;
    return JSON.stringify(place, null, 2);
  },
  async updatePlace(id, changes, userId) {
    const place = places.get(id);
    if (!place || place.userId !== userId) return null;
    Object.assign(place, changes);
    return place;
  },
  async deletePlaceById(id, userId) {
    const place = places.get(id);
    if (!place || place.userId !== userId) return false;
    return places.delete(id);
  },
  async deleteAllPlaces() { places.clear(); },
};

export function resetStores() {
  users.clear();
  places.clear();
}
