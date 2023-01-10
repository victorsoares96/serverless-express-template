/* eslint-disable no-console */
import winston, { createLogger, format } from 'winston';
import LokiTransport from 'winston-loki';

const projectName = 'serverless-express-template';

const log = createLogger({
  levels: winston.config.npm.levels,
  format: format.combine(
    // format.splat(),
    // format.simple(),
    format.label({ label: projectName }),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  ),
  transports: [
    new winston.transports.Console({
      level: 'info',
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, label, timestamp, ...rest }) => {
          return `${timestamp} [${label}] ${level}: ${message} ${
            Object.keys(rest).length ? JSON.stringify(rest) : ''
          }`;
        }),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      zippedArchive: true,
      format: format.combine(format.prettyPrint()),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      zippedArchive: true,
      format: format.combine(format.prettyPrint()),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: 'logs/exceptions.log',
      zippedArchive: true,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: 'logs/rejections.log',
      zippedArchive: true,
    }),
  ],
});

if (process.env.NODE_ENV === 'production' && process.env.LOKI_HOST) {
  log.add(
    new LokiTransport({
      host: process.env.LOKI_HOST as string,
      json: true,
      handleExceptions: true,
      handleRejections: true,
      // basicAuth: 'admin:admin',
      labels: { project: projectName, environment: process.env.NODE_ENV },
      onConnectionError: err => {
        console.log(err);
      },
    }),
  );
}

export default log;
