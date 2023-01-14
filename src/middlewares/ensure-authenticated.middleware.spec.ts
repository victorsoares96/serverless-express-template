import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import ensureAuthenticated, {
  TokenPayload,
} from './ensureAuthenticated.middleware';

describe('Authorization middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
    };
  });

  it('should to throw error if request received not have headers', async () => {
    mockRequest = {
      headers: {
        authorization: undefined,
      },
    };

    const middleware = ensureAuthenticated(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    await expect(middleware).rejects.toThrow(
      'Missing JWT token from the "Authorization" header',
    );
  });

  it('should to throw error if request received not have a valid token', async () => {
    mockRequest = {
      headers: {
        authorization: 'Bearer 123456',
      },
    };

    const middleware = ensureAuthenticated(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    await expect(middleware).rejects.toThrow('Invalid JWT');
  });

  it('should to call next function if request received have a valid token', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(
      () =>
        ({
          iat: 123456,
          exp: 123456,
          sub: '123456',
          name: 'John Doe',
        } as TokenPayload),
    );

    mockRequest = {
      headers: {
        authorization: 'Bearer jkkhkjhkjhkjhkj',
      },
    };

    const middleware = ensureAuthenticated(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    await expect(middleware).resolves.toBeUndefined();
    expect(nextFunction).toHaveBeenCalled();
  });
});
