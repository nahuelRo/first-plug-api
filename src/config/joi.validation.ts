import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  DB_CONNECTION_STRING: Joi.required(),
  PORT: Joi.number().default(3001),
  JWTSECRETKEY: Joi.required(),
  JWTREFRESHTOKENKEY: Joi.required(),
});
