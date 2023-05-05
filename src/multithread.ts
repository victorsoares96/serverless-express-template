import os from 'os';
import cluster from 'cluster';
import log from './utils/log.util';

const runPrimaryProcess = () => {
  const processesCount = os.cpus().length;

  log.info(`Primary ${process.pid} is running`);
  log.info(`Forking Server with ${processesCount} processes\n`);

  for (let index = 0; index < processesCount; index++) {
    cluster.fork();

    cluster.on('exit', (worker, code, signal) => {
      if (code !== 0 && !worker.exitedAfterDisconnect) {
        log.info(
          `Worker ${worker.process.pid} died with signal ${signal}, scheduling another one`,
        );
        cluster.fork();
      }
    });
  }
};

const runWorkerProcess = async () => {
  const { default: server } = await import('./app');
  await server.startServer();
};

(() => {
  if (cluster.isPrimary) {
    runPrimaryProcess();
  } else {
    runWorkerProcess();
  }
})();
