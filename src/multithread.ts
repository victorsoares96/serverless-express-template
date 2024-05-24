/* eslint-disable no-plusplus */
import cluster, { Worker } from 'cluster';
import os from 'os';

import Server from './server';
import log from './utils/log.util';
import Database from './database/database';
import env from './utils/env.util';

class Multithread {
  private shutdownInProgress = false;

  private hasCleanWorkerExit = true;

  private processStr = `${cluster.isPrimary ? 'master' : 'worker'} process ${
    process.pid
  }`;

  private workersCount = os.cpus().length;

  private database: Database;

  private server: Server;

  constructor() {
    this.database = new Database();
    this.server = new Server();

    this.registerShutdownListeners();

    if (cluster.isPrimary) {
      this.runPrimaryProcess();
    } else if (cluster.isWorker) {
      this.runWorkerProcess();
    }
  }

  private registerShutdownListeners() {
    process.on('SIGTERM', this.gracefulClusterShutdown('SIGTERM'));
    process.on('SIGINT', this.gracefulClusterShutdown('SIGINT'));
    process.on('unhandledRejection', async (reason, promise) => {
      log.error(`UNHANDLED REJECTION in ${this.processStr}:`, reason, promise);
      console.error(promise);
    });
    process.on('uncaughtException', async (error, origin) => {
      process.stdin.resume();
      log.error(`UNCAUGHT EXCEPTION in ${this.processStr}:`, error, origin);
    });
  }

  private gracefulClusterShutdown = (signal: NodeJS.Signals) => async () => {
    if (this.shutdownInProgress) return;

    this.shutdownInProgress = true;
    this.hasCleanWorkerExit = true;

    log.info(
      `ℹ️  Got ${signal} on ${
        this.processStr
      }. Graceful shutdown start at ${new Date().toISOString()}`,
    );

    try {
      if (cluster.isPrimary) {
        await this.shutdownWorkers(signal);
        log.info(`ℹ️  ${this.processStr} - worker shutdown successful`);
      }

      if (cluster.isWorker) await this.gracefulWorkerShutdown(); // stop yourself after the workers are shutdown if you are master
      log.info(`✅ ${this.processStr} shutdown successful`);
      process.exit(this.hasCleanWorkerExit ? 0 : 1);
    } catch (e) {
      process.exit(1);
    }
  };

  private shutdownWorkers(signal: NodeJS.Signals) {
    return new Promise<void>(resolve => {
      if (!cluster.isPrimary) {
        resolve();
        return;
      }

      if (!cluster.workers) {
        resolve();
        return;
      }

      const wIds = Object.keys(cluster.workers);

      if (wIds.length === 0) {
        resolve();
        return;
      }

      // Filter all the valid workers
      const workers = wIds
        .map(id => cluster.workers![id])
        .filter(v => v) as Worker[];
      let workersAlive = 0;
      let funcRun = 0;

      let interval: NodeJS.Timeout;

      // Count the number of alive workers and keep looping until the number is zero.
      const fn = () => {
        ++funcRun;
        workersAlive = 0;

        workers.forEach(worker => {
          if (!worker.isDead()) {
            ++workersAlive;
            if (funcRun === 1)
              // On the first execution of the function, send the received signal to all the workers
              worker.kill(signal);
          }
        });

        log.info(`ℹ️  ${workersAlive} workers alive`);

        if (workersAlive === 0) {
          // Clear the interval when all workers are dead
          clearInterval(interval);
          resolve();
        }
      };

      interval = setInterval(fn, 500);
    });
  }

  private async runPrimaryProcess() {
    log.info(
      `🚀 primary process running in port ${env.get('port')} with id: ${
        process.pid
      }, forking server with ${this.workersCount} processes!`,
    );

    for (let i = 0; i < this.workersCount; i++) {
      cluster.fork(); // create the workers
    }

    cluster.on('exit', (worker, code, signal) => {
      if (
        code !== 0 &&
        !worker.exitedAfterDisconnect &&
        !this.shutdownInProgress
      ) {
        log.info(
          `💀 worker ${worker.process.pid} died with code ${code} and signal ${signal}, scheduling another one...`,
        );

        cluster.fork();
      } else {
        log.info(
          `💀 worker ${worker.process.pid} died with code ${code} and signal ${signal}.`,
        );
      }

      if (this.shutdownInProgress && code !== 0) {
        this.hasCleanWorkerExit = false;
      }
    });
  }

  private async runWorkerProcess() {
    const connection = await this.database.connect();
    await this.server.startServer(connection, env.get('port'));

    log.info(`ℹ️  worker process running with id: ${process.pid}!`);
  }

  private async gracefulWorkerShutdown() {
    try {
      await this.server.closeServer();
      this.hasCleanWorkerExit = true;
      log.info(`✅ Graceful shutdown on ${this.processStr} success.`);
    } catch (error) {
      this.hasCleanWorkerExit = false;
      log.error(
        `❌ Graceful shutdown on ${this.processStr} failed. The process will forced to exit! Cause: ${error}`,
      );
      console.error(error);
    } finally {
      process.exit(this.hasCleanWorkerExit ? 0 : 1);
    }
  }
}

export default new Multithread();
