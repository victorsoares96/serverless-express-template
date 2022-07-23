import { Router } from 'express';
import ensureAuthenticated from '@/middlewares/ensureAuthenticated.middleware';
import { UsersController } from '../controllers/user.controller';

export const usersRouter = Router();
const usersController = new UsersController();

usersRouter.get('/users', ensureAuthenticated, usersController.index);

usersRouter.post('/users', /* ensureAuthenticated, */ usersController.create);

usersRouter.put('/users', ensureAuthenticated, usersController.update);

usersRouter.delete(
  '/users/remove',
  ensureAuthenticated,
  usersController.remove,
);

usersRouter.patch('/users/password', usersController.resetPassword);
