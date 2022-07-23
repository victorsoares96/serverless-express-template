'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.CreateUserService = void 0;

var _bcryptjs = require('bcryptjs');

var _classValidator = require('class-validator');

var _database = require('../../database');

var _user = require('../../entities/user.entity');

var _AppError = require('../../errors/AppError');

class CreateUserService {
  async execute({ name, username, email, password }) {
    if (!name || !username || !email || !password)
      throw new _AppError.AppError(
        'Please provide all fields: name, username, email and password.',
      );
    const userExists = await _database.dataSource.manager.findOne(_user.User, {
      where: [
        {
          name,
        },
        {
          email,
        },
        {
          username,
        },
      ],
    });
    if (userExists) throw new _AppError.AppError('User already exists.');

    const user = _database.dataSource.manager.create(_user.User, {
      name,
      username,
      email,
      password,
    });

    const [error] = await (0, _classValidator.validate)(user, {
      stopAtFirstError: true,
    });

    if (error && error.constraints) {
      const [message] = Object.values(error.constraints);
      throw new _AppError.AppError(message);
    }

    const hashPassword = await (0, _bcryptjs.hash)(password, 8);
    user.password = hashPassword;
    await _database.dataSource.manager.save(user);
    return user;
  }
}

exports.CreateUserService = CreateUserService;
