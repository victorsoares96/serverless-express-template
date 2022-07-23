'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = ensureAuthenticated;

var _jsonwebtoken = require('jsonwebtoken');

var _AppError = require('../errors/AppError');

var _auth = _interopRequireDefault(require('../config/auth'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function ensureAuthenticated(request, response, next) {
  const authHeader = request.headers.authorization;
  if (!authHeader) throw new _AppError.AppError('Missing JWT', 401);
  const [, token] = authHeader.split(' ');

  try {
    const decoded = (0, _jsonwebtoken.verify)(token, _auth.default.jwt.secret);
    const { sub, name } = decoded;
    request.user = {
      id: sub,
      name,
    };
    return next();
  } catch {
    throw new _AppError.AppError('Invalid JWT', 401);
  }
}
