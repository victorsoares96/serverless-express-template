import { NextFunction, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

export default async function showProjectVersion(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const packageJson = JSON.parse(
    fs.readFileSync(
      path.resolve(
        __dirname,
        process.env.NODE_ENV === 'production'
          ? 'package.json'
          : '../../package.json',
      ),
      'utf8',
    ),
  );
  response.header('X-Project-Version', packageJson.version);
  response.header('X-Project-Template-Version', packageJson.templateVersion);
  return next();
}
