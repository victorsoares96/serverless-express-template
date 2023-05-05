import { NextFunction, Response } from 'express';

export default async function showProjectVersion(
  request: unknown,
  response: Response,
  next: NextFunction,
  version: string,
  templateVersion: string,
): Promise<void> {
  response.header('X-Project-Version', version);
  response.header('X-Project-Template-Version', templateVersion);
  return next();
}
