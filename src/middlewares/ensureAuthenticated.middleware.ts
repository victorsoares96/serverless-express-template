import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { AppError } from '@/errors/AppError';

import authConfig from '../constants/auth';

export interface TokenPayload {
  iat: number;
  exp: number;
  sub: string;
  name: string;
}

export default async function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader)
    throw new AppError(
      'Missing JWT token from the "Authorization" header',
      401,
    );

  const [, token] = authHeader.split(' ');

  try {
    const decoded = verify(token, authConfig.jwt.secret);

    const { sub, name } = decoded as TokenPayload;

    request.user = {
      id: sub,
      name,
    };

    return next();
  } catch {
    throw new AppError('Invalid JWT', 401);
  }
}
