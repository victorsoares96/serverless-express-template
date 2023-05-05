/* eslint-disable import/no-named-as-default */
import 'reflect-metadata';
import 'express-async-errors';

import fs from 'fs';
import path from 'path';
import cors from 'cors';
import express from 'express';

import compression from 'compression';
import { errorHandler } from './middlewares/error-handler.middleware';
import handleConnectionToDatabase from './middlewares/handle-connection-to-database.middleware';
import { usersRouter } from './routes/users.routes';
import { router as sessionRouter } from './routes/session.routes';
import log from './utils/log.util';
import showProjectVersion from './middlewares/show-project-version.middleware';
import isLambda from './utils/is-lambda.util';
import { AppDataSourceInitialize, dataSource } from './database';

class App {
  public express: express.Application;

  private port: number;

  private version: string;

  private projectVersion: string;

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

    this.getProjectVersion();
  }

  private getProjectVersion(): void {
    let packageJson: { version: string; templateVersion: string };

    if (
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'staging'
    ) {
      packageJson = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'),
      );
    } else {
      packageJson = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'),
      );
    }

    this.version = packageJson.version;
    this.projectVersion = packageJson.templateVersion;
  }

  private routeLevelMiddlewares(): void {
    this.express.use((request, response, next) =>
      showProjectVersion(
        request,
        response,
        next,
        this.version,
        this.projectVersion,
      ),
    );

    if (isLambda()) {
      this.express.use(handleConnectionToDatabase);
    }
  }

  private errorHandlerMiddlewares(): void {
    this.express.use(errorHandler);
  }

  public startServer(): void {
    AppDataSourceInitialize().then(() => {
      log.info('📦  Connection to database open!');

      this.express
        .listen(this.port, () => {
          log.info(`🚀  Server started on port ${this.port}!`);
        })
        .on('error', err => {
          dataSource.destroy();
          log.error(`❌  Error when starting the server: ${err.message}`);
        });
    });
  }

  private routes(): void {
    this.express.use('/api/session', sessionRouter);
    this.express.use('/api/user', usersRouter);
  }
}

export default new App();
