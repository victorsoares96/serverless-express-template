import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import ensureAuthenticated from '@/middlewares/ensure-authenticated.middleware';
import { UsersController } from '../controllers/user.controller';
import { passwordRule } from '@/utils/validators.util';

export const router = Router();
const controller = new UsersController();

router.get(
  '/find-many',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().messages({
        'string.base': 'Name must be a string.',
      }),
      username: Joi.string().messages({
        'string.base': 'Username must be a string.',
      }),
      email: Joi.string().messages({
        'string.base': 'Email must be a string.',
      }),
      isDeleted: Joi.boolean().messages({
        'boolean.base': 'isDeleted must be a boolean.',
      }),
      offset: Joi.number().messages({
        'number.base': 'Offset must be a number.',
      }),
      isAscending: Joi.boolean().messages({
        'boolean.base': 'isAscending must be a boolean.',
      }),
      limit: Joi.number().messages({
        'number.base': 'Limit must be a number.',
      }),
    }),
  }),
  ensureAuthenticated,
  controller.index,
);

router.post(
  '/create',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required().messages({
        'string.base': 'Name must be a string.',
        'any.required': 'Name is required.',
      }),
      username: Joi.string().required().messages({
        'string.base': 'Username must be a string.',
        'any.required': 'Username is required.',
      }),
      email: Joi.string().email().required().messages({
        'string.base': 'Email must be a string.',
        'any.required': 'Email is required.',
        'string.email': 'Email is invalid.',
      }),
      password: Joi.string().regex(passwordRule).required().messages({
        'string.base': 'Password must be a string.',
        'any.required': 'Password is required.',
        'string.pattern.base':
          'Password must be at least 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.',
      }),
    }),
  }),
  controller.create,
);

router.put(
  '/update',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      id: Joi.string().required().messages({
        'string.base': 'Id must be a string.',
        'any.required': 'The user id must be provided.',
      }),
      name: Joi.string().messages({
        'string.base': 'Name must be a string.',
      }),
      email: Joi.string().email().messages({
        'string.email': 'Email is invalid.',
      }),
    }),
  }),
  ensureAuthenticated,
  controller.update,
);

router.delete(
  '/remove',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      ids: Joi.string().required().messages({
        'string.base': 'Ids must be a string.',
        'any.required': 'The user(s) id(s) must be provided.',
      }),
    }),
  }),
  ensureAuthenticated,
  controller.remove,
);

router.delete(
  '/soft-remove',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      ids: Joi.string().required().messages({
        'string.base': 'Ids must be a string.',
        'any.required': 'The user(s) id(s) must be provided.',
      }),
    }),
  }),
  ensureAuthenticated,
  controller.softRemove,
);

router.patch(
  '/recover',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      ids: Joi.string().required().messages({
        'string.base': 'Ids must be a string.',
        'any.required': 'The user(s) id(s) must be provided.',
      }),
    }),
  }),
  ensureAuthenticated,
  controller.recover,
);

router.patch(
  '/reset-password',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      id: Joi.string().required().messages({
        'string.base': 'Id must be a string.',
        'any.required': 'The user id must be provided.',
      }),
      currentPassword: Joi.string().required().messages({
        'string.base': 'Current password must be a string.',
        'any.required': 'The current password must be provided.',
      }),
      newPassword: Joi.string().regex(passwordRule).required().messages({
        'string.base': 'New password must be a string.',
        'any.required': 'The new password must be provided.',
        'string.pattern.base':
          'Password must be at least 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.',
      }),
    }),
  }),
  controller.resetPassword,
);

router.patch('/change-avatar', ensureAuthenticated, controller.changeAvatar);
