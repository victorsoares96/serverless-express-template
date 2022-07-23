import { Router } from 'express';
import { AuthenticateController } from '@/controllers/authenticate.controller';

export const authenticateRouter = Router();
const authenticateController = new AuthenticateController();

authenticateRouter.post('/auth', authenticateController.execute);
