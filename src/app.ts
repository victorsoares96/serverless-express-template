import 'dotenv/config';
import 'reflect-metadata';

import cors from 'cors';
import express from 'express';
import 'express-async-errors';

import compression from 'compression';
import { errorHandler } from './middlewares/errorHandler.middleware';
import handleConnectionToDatabase from './middlewares/handleConnectionToDatabase.middleware';
import { usersRouter } from './routes/users.routes';
import { authenticateRouter } from './routes/authenticate.routes';

class App {
  public express: express.Application;

  public constructor() {
    this.express = express();
    this.express.use(compression());
    this.express.use(cors());
    this.express.use(express.json());
    this.express.use(express.json({ limit: '5mb' }));
    this.express.use(express.urlencoded({ limit: '5mb', extended: true }));

    this.routeLevelMiddlewares();
    this.routes();
    this.errorHandlerMiddlewares();
  }

  private routeLevelMiddlewares(): void {
    this.express.use(handleConnectionToDatabase);
  }

  private errorHandlerMiddlewares(): void {
    this.express.use(errorHandler);
  }

  private routes(): void {
    this.express.use(authenticateRouter);
    this.express.use(usersRouter);
  }
}

export default new App().express;
