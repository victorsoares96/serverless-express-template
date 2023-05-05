import { NextFunction, Request, Response } from 'express';
import showProjectVersion from './show-project-version.middleware';

describe('show-project-version', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const nextFunction: NextFunction = jest.fn();
  const version = '1.0.0';
  const templateVersion = '1.0.0';

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
      header: jest.fn().mockReturnThis(),
    };
  });

  it('should to show project and template version in response header', async () => {
    await showProjectVersion(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
      version,
      templateVersion,
    );

    expect(mockResponse.header).toHaveBeenCalledWith(
      'X-Project-Version',
      version,
    );
    expect(mockResponse.header).toHaveBeenCalledWith(
      'X-Project-Template-Version',
      templateVersion,
    );
    expect(nextFunction).toHaveBeenCalled();
  });
});
