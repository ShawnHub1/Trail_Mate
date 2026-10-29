import Mongoose from "mongoose";
import { Place } from "./place.js";

export const placeMongoStore = {
  async getAllPlaces() { return Place.find().lean(); },
  async getUserPlaces(userId) {
    if (!Mongoose.isValidObjectId(userId)) return [];
    return Place.find({ userId }).lean();
  },
  async getPlaceById(id) {
    if (!Mongoose.isValidObjectId(id)) return null;
    return Place.findById(id).lean();
  },
  async getPlaceJson(id, userId) {
    if (!Mongoose.isValidObjectId(id) || !Mongoose.isValidObjectId(userId)) return null;
    const place = await Place.findOne({ _id: id, userId }).lean();
    return place ? JSON.stringify(place, null, 2) : null;
  },
  async addPlace(place) {
    const saved = await Place.create(place);
    return saved.toObject();
  },
  async updatePlace(id, changes, userId) {
    if (!Mongoose.isValidObjectId(id) || !Mongoose.isValidObjectId(userId)) return null;
    return Place.findOneAndUpdate({ _id: id, userId }, changes, { new: true, runValidators: true }).lean();
  },
  async deletePlaceById(id, userId) {
    if (!Mongoose.isValidObjectId(id) || !Mongoose.isValidObjectId(userId)) return false;
    const result = await Place.deleteOne({ _id: id, userId });
    return result.deletedCount === 1;
  },
  async deleteAllPlaces() { await Place.deleteMany({}); },
};
