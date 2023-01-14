import { NextFunction, Request, Response } from 'express';
import packageJson from '../../package.json';

export default async function showProjectVersion(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  response.header('X-Project-Version', packageJson.version);
  response.header('X-Project-Template-Version', packageJson.templateVersion);
  return next();
}
