import env from './utils/env.util';
import log from './utils/log.util';

(async () => {
  try {
    const { default: Database } = await import('./database/database');
    const { default: Server } = await import('./server');

    const database = new Database();
    const server = new Server();

    const connection = await database.connect();
    await server.startServer(connection, env.get('port'));

    log.info(
      `🚀  Server started on port ${env.get('port')}, process id: ${
        process.pid
      }!`,
    );
  } catch (error) {
    if (error instanceof Error) {
      log.error(
        `❌  Error when initializing server. ${error.message} ${error.stack}`,
      );
    } else {
      log.error(`❌  Error when initializing server. ${error}`);
    }
  }
})();
