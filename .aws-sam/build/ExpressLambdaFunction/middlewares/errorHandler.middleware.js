'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.errorHandler = errorHandler;

var _AppError = require('../errors/AppError');

function errorHandler(error, request, response, _) {
  console.error(error);

  if (error instanceof _AppError.AppError) {
    return response.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  if (error instanceof Error) {
    return response.status(500).json({
      status: 'error',
      message: error.message,
    });
  }

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error.',
  });
}
