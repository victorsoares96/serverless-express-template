/* eslint-disable import/no-named-as-default */
import 'reflect-metadata';
import 'express-async-errors';

import fs from 'fs';
import path from 'path';
import cors from 'cors';
import express from 'express';
import fileUpload from 'express-fileupload';

import compression from 'compression';
import { Server } from 'http';
import { errorHandler } from './middlewares/error-handler.middleware';
import handleConnectionToDatabase from './middlewares/handle-connection-to-database.middleware';
import { router as userRouter } from './routes/users.routes';
import { router as sessionRouter } from './routes/session.routes';
import log from './utils/log.util';
import showProjectVersion from './middlewares/show-project-version.middleware';
import isLambda from './utils/is-lambda.util';
import { AppDataSourceInitialize, dataSource } from './database';

class App {
  public express: express.Application;

  private server: Server;

  private port: number;

  private version: string;

  private projectVersion: string;

  public constructor() {
    this.port = 3333;

    this.express = express();
    this.express.use(fileUpload());
    this.express.use(compression());
    this.express.use(cors());
    this.express.use(express.json());
    this.express.use(express.json({ limit: '5mb' }));
    this.express.use(express.urlencoded({ limit: '5mb', extended: true }));

    this.listeners();

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

  public async startServer(): Promise<void> {
    await AppDataSourceInitialize();
    log.info('📦  Connection to database open!');
    this.server = this.express
      .listen(this.port, () => {
        log.info(`🚀  Server started on port ${this.port}!`);
      })
      .on('error', err => {
        dataSource.destroy();
        log.error(`❌  Error when starting the server: ${err.message}`);
      });
  }

  public async closeServer(): Promise<void> {
    try {
      await dataSource.destroy();
      this.server.close();
    } catch (error) {
      // process.exit();
    }
  }

  private routes(): void {
    this.express.use('/api/session', sessionRouter);
    this.express.use('/api/user', userRouter);
  }

  private listeners(): void {
    // SIGINT signal (CTRL-C)
    process.on('SIGINT', () => {
      log.warn('[PROCESS]: received SIGINT signal');
      this.closeServer();
    });

    // SIGTERM signal (Docker stop)
    process.on('SIGTERM', () => {
      log.warn('[PROCESS]: received SIGTERM signal');
      this.closeServer();
    });

    process.on('uncaughtException', error => {
      log.error('[PROCESS]: uncaught exception: ', error);
      this.closeServer();
    });

    process.on('unhandledRejection', (reason, promise) => {
      log.error(`[PROCESS]: Unhandled rejection: ${reason} ${promise}`);
      log.error(promise);
      this.closeServer();
    });
  }
}

export default new App();
