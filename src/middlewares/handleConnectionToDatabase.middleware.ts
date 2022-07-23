import { NextFunction, Request, Response } from 'express';
import { AppDataSourceInitialize, dataSource } from '@/database';
import { AppError } from '@/errors/AppError';

export default async function handleConnectionToDatabase(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!dataSource.isInitialized) await AppDataSourceInitialize();
    console.log('📦  Connection to database open!');
    console.log(
      `[URL]: ${request.url} [METHOD]: ${
        request.method
      } [BODY]: ${JSON.stringify(request.body)}`,
    );

    response.on('finish', async () => {
      await dataSource.destroy();
      console.log('📦  Connection to database closed!');
    });

    return next();
  } catch (error) {
    console.log(error);
    throw new AppError('❌  Error when initializing the database.', 500);
  }
}
