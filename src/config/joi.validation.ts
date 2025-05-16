import * as Joi from 'joi';

export const JoiVaildationSchema = Joi.object({
  MONGO_DB: Joi.required(),
  PORT: Joi.number().default(3001),
  DEFAULT_LIMIT: Joi.number().default(10),
});
