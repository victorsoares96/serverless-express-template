import os from 'os';
import cluster from 'cluster';
import log from './utils/log.util';

const runPrimaryProcess = () => {
  const processesCount = os.cpus().length;

  log.info(
    `🚀 Primary process running with id: ${process.pid}, forking server with ${processesCount} processes!`,
  );

  for (let index = 0; index < processesCount; index++) {
    cluster.fork();

    cluster.on('exit', (worker, code, signal) => {
      if (code !== 0 && !worker.exitedAfterDisconnect) {
        log.info(
          `💀 worker ${worker.process.pid} died with signal ${signal}, scheduling another one...`,
        );
        cluster.fork();
      }
    });
  }
};

const runWorkerProcess = async () => {
  const { default: Database } = await import('./database/database');
  const { default: Server } = await import('./server');

  const database = new Database();
  const server = new Server();

  const connection = await database.connect();
  await server.startServer(connection);

  log.info(`ℹ️  Worker process running with id: ${process.pid}!`);
};

(async () => {
  try {
    if (cluster.isPrimary) {
      runPrimaryProcess();
    } else {
      await runWorkerProcess();
    }
  } catch (error) {
    if (error instanceof Error) {
      log.error(`${error.message} ${error.stack}`);
    } else log.error(error);
  }
})();
