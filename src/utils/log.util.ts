/* eslint-disable no-restricted-syntax */
import winston, { createLogger, format } from 'winston';
import LokiTransport from 'winston-loki';

const projectName = 'serverless-express-template';

const log = createLogger({
  levels: winston.config.npm.levels,
  format: format.combine(
    format.colorize(),
    format.timestamp({
      format: 'DD-MM-YYYY HH:mm:ss',
    }),
    format.errors({ stack: true, trace: true }),
    format.splat(),
    format.json(),
  ),
  transports: [
    new winston.transports.Console({
      level: 'info',
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, ...rest }) => {
          const restString = Object.keys(rest)
            .map(key => `${key}: ${rest[key]}`)
            .join(' ');

          return `${timestamp} [${level}]: ${message} ${restString}`;
        }),
      ),
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

if (process.env.NODE_ENV === 'development') {
  log.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      zippedArchive: true,
      format: format.combine(format.prettyPrint()),
    }),
  );

  log.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      zippedArchive: true,
      format: format.combine(format.prettyPrint()),
    }),
  );
}

if (process.env.LOKI_HOST) {
  log.add(
    new LokiTransport({
      host: process.env.LOKI_HOST,
      json: true,
      handleExceptions: true,
      handleRejections: true,
      labels: { Application: projectName },
      onConnectionError: err => {
        console.log(err);
      },
    }),
  );
}

export default log;
