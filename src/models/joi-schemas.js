import Joi from "joi";
import { TRAIL_DIFFICULTIES } from "./trail-options.js";

export const UserSpec = Joi.object({
  firstName: Joi.string().trim().min(1).max(60).example("Homer").required(),
  lastName: Joi.string().trim().min(1).max(60).example("Simpson").required(),
  email: Joi.string().trim().email().lowercase().example("homer@simpson.com").required(),
  password: Joi.string().min(8).max(128).example("secret").required(),
})
  .label("UserDetails");

export const UserArray = Joi.array().items(UserSpec).label("UserArray");

export const UserCredentialsSpec = Joi.object({
  email: Joi.string().trim().email().lowercase().example("homer@simpson.com").required(),
  password: Joi.string().example("secret").required(),
})
  .label("UserCredentials");

export const UserProfileSpec = Joi.object({
  firstName: Joi.string().trim().min(1).max(60).example("Homer"),
  lastName: Joi.string().trim().min(1).max(60).example("Simpson"),
  email: Joi.string().trim().email().lowercase().example("homer@simpson.com"),
})
  .label("UserProfile");

export const PlaceSpec = Joi.object({
  name: Joi.string().trim().min(1).max(100).example("Example Trail").required(),
  description: Joi.string().trim().max(2000).allow("").default(""),
  difficulty: Joi.string().trim().valid(...TRAIL_DIFFICULTIES).allow("").default(""),
  distanceKm: Joi.number().empty("").min(0.1).allow(null),  
  latitude: Joi.number().empty("").min(-90).max(90).allow(null),
  longitude: Joi.number().empty("").min(-180).max(180).allow(null),
}).and("latitude", "longitude").messages({ "object.and": "Latitude and longitude must be provided together." });

export const PlaceUpdateSpec = Joi.object({
  name: Joi.string().trim().min(1).max(100).example("Example Trail"),
  description: Joi.string().trim().max(2000).allow(""),
  difficulty: Joi.string().trim().valid(...TRAIL_DIFFICULTIES).allow(""),
  distanceKm: Joi.number().empty("").min(0.1).allow(null),  
  latitude: Joi.number().empty("").min(-90).max(90).allow(null),
  longitude: Joi.number().empty("").min(-180).max(180).allow(null),
}).min(1).and("latitude", "longitude").messages({ "object.and": "Latitude and longitude must be provided together." });

export const UserResponseSpec = Joi.object({
  _id: Joi.string(),
  firstName: Joi.string(),
  lastName: Joi.string(),
  email: Joi.string().email(),
}).label("UserResponse");
