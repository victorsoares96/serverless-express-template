import { NextFunction, Request, Response } from 'express';
import { AppError } from '@/errors/AppError';
import { errorHandler } from './error-handler.middleware';

describe('Error handler middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(), // This line
      send: jest.fn(), // also mocking for send function
      json: jest.fn(),
    };
  });

  it('should to handle error when error if instance of AppError', async () => {
    const error = new AppError('This is a test error', 401);

    await errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Error',
      message: 'This is a test error',
      stack: undefined,
      statusCode: 401,
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should to handle error when error if instance of Error', async () => {
    const error = new Error('This is a test error');

    await errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Error',
      message: 'This is a test error',
      statusCode: 500,
      stack: error.stack,
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should to handle error when error is unknown', async () => {
    const error: unknown = {
      message: 'Unknown Error',
    };
    await errorHandler(
      error as AppError,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An internal server error has occurred, please try again later.',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
