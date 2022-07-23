'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.RemoveUserService = void 0;

var _typeorm = require('typeorm');

var _database = require('../../database');

var _user = require('../../entities/user.entity');

var _AppError = require('../../errors/AppError');

class RemoveUserService {
  constructor(options) {
    this.softRemove = false;

    if (options && options.softRemove) {
      this.softRemove = options.softRemove;
    }
  }

  async execute({ ids }) {
    if (!ids) throw new _AppError.AppError('The user ids must be provided.');
    const userIds = ids.split(',');
    const users = await _database.dataSource.manager.find(_user.User, {
      where: {
        id: (0, _typeorm.In)(userIds),
      },
    });

    if (users.length !== userIds.length) {
      throw new _AppError.AppError("Some users doesn't could be found.");
    }

    if (this.softRemove) {
      await _database.dataSource.manager.softRemove(users);
    } else {
      await _database.dataSource.manager.remove(users);
    }
  }
}

exports.RemoveUserService = RemoveUserService;
