'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.RecoverUserService = void 0;

var _typeorm = require('typeorm');

var _database = require('../../database');

var _user = require('../../entities/user.entity');

var _AppError = require('../../errors/AppError');

class RecoverUserService {
  async execute({ ids }) {
    if (!ids) throw new _AppError.AppError('The user ids must be provided.');
    const userIds = ids.split(',');
    const users = await _database.dataSource.manager.find(_user.User, {
      where: {
        id: (0, _typeorm.In)(userIds),
      },
      withDeleted: true,
    });

    if (users.length !== userIds.length) {
      throw new _AppError.AppError("Some users doesn't could be found.");
    }

    await _database.dataSource.manager.recover(users);
  }
}

exports.RecoverUserService = RecoverUserService;
