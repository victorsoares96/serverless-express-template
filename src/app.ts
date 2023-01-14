/* eslint-disable import/no-named-as-default */
import 'reflect-metadata';
import 'express-async-errors';

import cors from 'cors';
import express from 'express';

import compression from 'compression';
import { errorHandler } from './middlewares/errorHandler.middleware';
import handleConnectionToDatabase from './middlewares/handleConnectionToDatabase.middleware';
import { usersRouter } from './routes/users.routes';
import { authenticateRouter } from './routes/authenticate.routes';
import log from './utils/log.util';
import showProjectVersion from './middlewares/show-project-version.middleware';

class App {
  public express: express.Application;

  private port: number;

  public constructor() {
    this.port = 3333;

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
    this.express.use(showProjectVersion);
    this.express.use(handleConnectionToDatabase);
  }

  private errorHandlerMiddlewares(): void {
    this.express.use(errorHandler);
  }

  public startServer(): void {
    this.express
      .listen(this.port, () => {
        log.info(`🚀  Server started on port ${this.port}!`);
      })
      .on('error', err => {
        log.error(`❌  Error when starting the server: ${err.message}`);
      });
  }

  private routes(): void {
    this.express.use(authenticateRouter);
    this.express.use(usersRouter);
  }
}

export default new App();
