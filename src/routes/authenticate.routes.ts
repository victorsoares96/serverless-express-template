import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import { AuthenticateController } from '@/controllers/authenticate.controller';

export const authenticateRouter = Router();
const authenticateController = new AuthenticateController();

authenticateRouter.post(
  '/auth',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      username: Joi.string().required().messages({
        'string.base': 'Username must be a string.',
        'any.required': 'Username is required.',
      }),
      password: Joi.string().required().messages({
        'string.base': 'Password must be a string.',
        'any.required': 'Password is required.',
      }),
    }),
  }),
  authenticateController.execute,
);
