import * as dotenv from "dotenv";
import Mongoose from "mongoose";

dotenv.config();

export async function connectMongo() {
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error("DATABASE_URL is required to connect to MongoDB.");
  Mongoose.set("strictQuery", true);
  await Mongoose.connect(uri);
  return Mongoose.connection;
}