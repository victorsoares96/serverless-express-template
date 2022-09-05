import { NextFunction, Request, Response } from 'express';
import { AppDataSourceInitialize, dataSource } from '@/database';
import { AppError } from '@/errors/AppError';
import log from '@/utils/log.util';

export default async function handleConnectionToDatabase(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!dataSource.isInitialized) await AppDataSourceInitialize();
    log.info('📦  Connection to database open!');
    log.info(`URL: ${request.url} METHOD: ${request.method} IP: ${request.ip}`);

    response.on('finish', async () => {
      await dataSource.destroy();
      log.info('📦  Connection to database closed!');
    });

    return next();
  } catch (error) {
    log.error(error);
    throw new AppError('❌  Error when initializing the database.', 500);
  }
}
