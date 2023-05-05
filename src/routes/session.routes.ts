import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import { SessionController } from '@/controllers/session.controller';

export const router = Router();
const controller = new SessionController();

router.post(
  '/create',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      username: Joi.string().required(),
      password: Joi.string().required(),
    }),
  }),
  controller.create,
);

router.post(
  '/refresh',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      refreshToken: Joi.string().required(),
    }),
  }),
  controller.refresh,
);
