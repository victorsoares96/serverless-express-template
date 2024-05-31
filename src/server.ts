/* eslint-disable import/no-named-as-default */
import 'reflect-metadata';
import 'express-async-errors';

import fs from 'fs';
import path from 'path';
import cors from 'cors';
import express from 'express';
import fileUpload from 'express-fileupload';

import compression from 'compression';
import http from 'http';
import NodeCache from 'node-cache';
import { DataSource } from 'typeorm';
import { errorHandler } from './middlewares/error-handler.middleware';
import handleConnectionToDatabase from './middlewares/handle-connection-to-database.middleware';
import { router as userRouter } from './routes/users.routes';
import { router as sessionRouter } from './routes/session.routes';
import log from './utils/log.util';
import showProjectVersion from './middlewares/show-project-version.middleware';
import isLambda from './utils/is-lambda.util';
import env from './utils/env.util';
import { LOCAL_STORAGE_PATH } from './utils/storage.util';

const cache = new NodeCache();

class Server {
  public express: express.Application;

  private server: http.Server;

  private connection: DataSource;

  private PORT: number;

  private projectVersion: string;

  private templateVersion: string;

  public constructor() {
    this.PORT = Number(env.get('port'));

    this.express = express();
    this.express.use(
      fileUpload({
        limits: { fileSize: 20 * 1024 * 1024 },
      }),
    );
    this.express.use(compression());
    this.express.use(cors());
    this.express.use(express.json());
    this.express.use(express.json({ limit: '5mb' }));
    this.express.use(express.urlencoded({ limit: '5mb', extended: true }));

    if (!isLambda()) this.getProjectVersion();
  }

  private getProjectVersion(): void {
    const projectVersion = cache.get<string>('project-version');
    const templateVersion = cache.get<string>('template-version');

    if (projectVersion && templateVersion) {
      this.projectVersion = projectVersion;
      this.templateVersion = templateVersion;
      return;
    }

    let packageJson: { version: string; templateVersion: string };

    if (fs.existsSync(path.resolve(__dirname, 'package.json'))) {
      packageJson = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'),
      );
    } else {
      packageJson = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'),
      );
    }

    cache.set('project-version', packageJson.version);
    cache.set('template-version', packageJson.templateVersion);

    this.projectVersion = packageJson.version;
    this.templateVersion = packageJson.templateVersion;
  }

  private routeLevelMiddlewares(): void {
    this.express.use((...handlers) =>
      showProjectVersion(
        ...handlers,
        this.projectVersion,
        this.templateVersion,
      ),
    );

    if (isLambda()) {
      this.express.use(handleConnectionToDatabase);
    }
  }

  private errorHandlerMiddlewares(): void {
    this.express.use(errorHandler);
  }

  private routes(): void {
    this.express.use('/bucket', express.static(LOCAL_STORAGE_PATH));
    this.express.use('/api/session', sessionRouter);
    this.express.use('/api/user', userRouter);
  }

  private async createServer(): Promise<http.Server> {
    const httpServer = http.createServer(this.express);
    return httpServer;
  }

  public async startServer(
    connection: DataSource,
    port?: number,
  ): Promise<http.Server> {
    this.connection = connection;

    this.server = await this.createServer();

    this.routeLevelMiddlewares();
    this.routes();
    this.errorHandlerMiddlewares();

    if (port) this.PORT = port;
    this.server.listen(port);

    return this.server;
  }

  public async closeServer(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.server?.close(error => {
        if (error) reject(error);

        return this.connection
          .destroy()
          .then(() => {
            log.info(`[SERVER]: closed all connections`);
            resolve();
          })
          .catch(reject);
      });
    });
  }
}

export default Server;
