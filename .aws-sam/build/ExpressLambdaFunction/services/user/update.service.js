'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.UpdateUserService = void 0;

var _classValidator = require('class-validator');

var _database = require('../../database');

var _user = require('../../entities/user.entity');

var _AppError = require('../../errors/AppError');

class UpdateUserService {
  async execute(userData) {
    const { id } = userData;
    if (!id) throw new _AppError.AppError('The user id must be provided.');
    const user = await _database.dataSource.manager.findOne(_user.User, {
      where: {
        id,
      },
    });
    if (!user) throw new _AppError.AppError('The user does not exist.');
    const updatedUser = { ...user, ...userData };
    const [error] = await (0, _classValidator.validate)(updatedUser, {
      stopAtFirstError: true,
    });

    if (error && error.constraints) {
      const [message] = Object.values(error.constraints);
      throw new _AppError.AppError(message);
    }

    await _database.dataSource.manager.save(updatedUser);
    return updatedUser;
  }
}

exports.UpdateUserService = UpdateUserService;
