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

export const PlaceSpec = {
  name: Joi.string().trim().min(1).max(100).required(),
};
