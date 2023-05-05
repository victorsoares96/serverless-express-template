/* eslint-disable no-restricted-syntax */
import { Request, Response, NextFunction } from 'express';
import { isCelebrateError } from 'celebrate';
import EscapeHtml from 'escape-html';
import { Error as CustomError } from '@/types/error.type';
import { AppError } from '@/errors/AppError';
import log from '@/utils/log.util';

export function errorHandler(
  error: Error,
  request: Request,
  response: Response,
  _: NextFunction,
): Response {
  if (error instanceof AppError) {
    log.error(
      `[ERROR HANDLER]: ${error.name}, ${error.message}, ${error.stack}`,
    );

    return response.status(error.statusCode).json({
      statusCode: error.statusCode,
      error: error.name,
      message: error.message,
      stack: error.stack,
    } as CustomError);
  }

  if (isCelebrateError(error)) {
    const validation: { [key: string]: unknown } = {};

    for (const [segment, joiError] of error.details.entries()) {
      validation[segment] = {
        source: segment,
        keys: joiError.details.map(detail => EscapeHtml(detail.path.join('.'))),
        message: joiError.message,
      };
    }

    log.error(
      `[ERROR HANDLER]: ${error.name}, ${error.message}, ${error.stack}`,
    );

    return response.status(400).json({
      statusCode: 400,
      error: error.name,
      message: error.message,
      validation,
      stack: error.stack,
    } as CustomError);
  }

  if (error instanceof Error) {
    log.error(
      `[ERROR HANDLER]: ${error.name}, ${error.message}, ${error.stack}`,
    );

    return response.status(500).json({
      statusCode: 500,
      error: error.name,
      message: error.message,
      stack: error.stack,
    } as CustomError);
  }

  log.error(`[ERROR HANDLER]: unknown error`);
  return response.status(500).json({
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'An internal server error has occurred, please try again later.',
  } as CustomError);
}
