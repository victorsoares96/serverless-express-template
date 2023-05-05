import { NextFunction, Request, Response } from 'express';
import { AppError } from '@/errors/AppError';

import { TokenProvider } from '@/utils/token.util';

export interface TokenPayload {
  iat: number;
  exp: number;
  sub: string;
  name: string;
}

const tokenProvider = new TokenProvider();

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
    const { sub, name } = tokenProvider.verify<TokenPayload>(token);

    request.user = {
      id: sub,
      name,
    };

    return next();
  } catch {
    throw new AppError('Invalid JWT', 401);
  }
}
