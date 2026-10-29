import Joi from "joi";

export const UserSpec = {
  firstName: Joi.string().trim().min(1).max(60).required(),
  lastName: Joi.string().trim().min(1).max(60).required(),
  email: Joi.string().trim().email().lowercase().required(),
  password: Joi.string().min(8).max(128).required(),
};

export const UserCredentialsSpec = {
  email: Joi.string().trim().email().lowercase().required(),
  password: Joi.string().required(),
};

export const UserProfileSpec = {
  firstName: Joi.string().trim().min(1).max(60).required(),
  lastName: Joi.string().trim().min(1).max(60).required(),
  email: Joi.string().trim().email().lowercase().required(),
};

export const PlaceSpec = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  description: Joi.string().trim().max(2000).allow("").default(""),
  latitude: Joi.number().empty("").min(-90).max(90).allow(null),
  longitude: Joi.number().empty("").min(-180).max(180).allow(null),
}).and("latitude", "longitude").messages({ "object.and": "Latitude and longitude must be provided together." });

export const PlaceUpdateSpec = Joi.object({
  name: Joi.string().trim().min(1).max(100),
  description: Joi.string().trim().max(2000).allow(""),
  latitude: Joi.number().empty("").min(-90).max(90).allow(null),
  longitude: Joi.number().empty("").min(-180).max(180).allow(null),
}).min(1).and("latitude", "longitude").messages({ "object.and": "Latitude and longitude must be provided together." });
