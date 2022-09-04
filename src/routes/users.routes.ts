import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import ensureAuthenticated from '@/middlewares/ensureAuthenticated.middleware';
import { UsersController } from '../controllers/user.controller';
import { passwordRule } from '@/utils/validators.util';

export const usersRouter = Router();
const usersController = new UsersController();

usersRouter.get('/users', ensureAuthenticated, usersController.index);

usersRouter.post(
  '/users',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required(),
      username: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().regex(passwordRule).required().messages({
        'any.required': 'Password is required.',
        'string.pattern.base':
          'Password must be at least 8 characters, one uppercase and one number.',
      }),
    }),
  }),
  usersController.create,
);

usersRouter.put('/users', ensureAuthenticated, usersController.update);

usersRouter.delete(
  '/users/remove',
  ensureAuthenticated,
  usersController.remove,
);

usersRouter.patch('/users/password', usersController.resetPassword);
