import Mongoose from "mongoose";
import { User } from "./user.js";
import { hashPassword, verifyPassword } from "../passwords.js";

export const userMongoStore = {
  async getAllUsers() { return User.find().select("-password").lean(); },
  async getUserById(id) {
    if (!Mongoose.isValidObjectId(id)) return null;
    return User.findById(id).select("-password").lean();
  },
  async getUserByEmail(email) {
    return User.findOne({ email: email.trim().toLowerCase() }).lean();
  },
  async addUser(input) {
    const user = await User.create({ ...input, password: await hashPassword(input.password) });
    const { password, ...safeUser } = user.toObject();
    return safeUser;
  },
  async verifyPassword(user, password) { return verifyPassword(user?.password, password); },
  async updateUser(id, changes) {
    if (!Mongoose.isValidObjectId(id)) return null;
    return User.findByIdAndUpdate(id, changes, { new: true, runValidators: true }).select("-password").lean();
  },
  async deleteUserById(id) {
    if (!Mongoose.isValidObjectId(id)) return false;
    const result = await User.deleteOne({ _id: id });
    return result.deletedCount === 1;
  },
  async deleteAll() { await User.deleteMany({}); },
};
