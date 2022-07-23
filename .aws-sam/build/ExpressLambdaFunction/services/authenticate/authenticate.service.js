"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthenticateService = void 0;

var _bcryptjs = require("bcryptjs");

var _jsonwebtoken = require("jsonwebtoken");

var _database = require("../../database");

var _user = require("../../entities/user.entity");

var _AppError = require("../../errors/AppError");

var _auth = _interopRequireDefault(require("../../config/auth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class AuthenticateService {
  async execute({
    username,
    password
  }) {
    const user = await _database.dataSource.manager.findOne(_user.User, {
      where: {
        username
      }
    });

    if (!user) {
      throw new _AppError.AppError('Invalid username or password. Please, try again.', 401);
    }

    const passwordMatched = await (0, _bcryptjs.compare)(password, user.password);

    if (!passwordMatched) {
      throw new _AppError.AppError('Invalid username or password. Please, try again.', 401);
    }

    const {
      secret,
      expiresIn
    } = _auth.default.jwt;
    const token = (0, _jsonwebtoken.sign)({
      name: user.name
    }, secret, {
      subject: String(user.id),
      expiresIn
    });
    await _database.dataSource.manager.save(user);
    return {
      user,
      token
    };
  }

}

exports.AuthenticateService = AuthenticateService;