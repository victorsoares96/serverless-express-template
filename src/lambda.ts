import 'source-map-support/register';
import serverlessExpress from '@vendia/serverless-express';
import Server from './server';

const server = new Server();
export const handler = serverlessExpress({ app: server.express });
