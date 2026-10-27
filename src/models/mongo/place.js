import Mongoose from "mongoose";

const { Schema } = Mongoose;

const placeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 2000 },
  category: { type: String, trim: true },
  location: {
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 },
  },
  imageUrl: String,
}, { timestamps: true });

export const Place = Mongoose.models.Place || Mongoose.model("Place", placeSchema);