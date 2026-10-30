import Mongoose from "mongoose";
import { TRAIL_DIFFICULTIES } from "../trail-options.js";

const { Schema } = Mongoose;

const placeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 2000 },
  difficulty: { type: String, trim: true, enum: ["", ...TRAIL_DIFFICULTIES], default: "" },
  distanceKm: { type: Number, min: 0.1, default: null },  
  category: { type: String, trim: true },
  latitude: { type: Number, min: -90, max: 90, default: null },
  longitude: { type: Number, min: -180, max: 180, default: null },
  imageUrl: String,
}, { timestamps: true });

export const Place = Mongoose.models.Place || Mongoose.model("Place", placeSchema);