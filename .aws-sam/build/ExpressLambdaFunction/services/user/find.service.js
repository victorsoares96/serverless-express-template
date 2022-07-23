"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FindUserService = void 0;

var _typeorm = require("typeorm");

var _database = require("../../database");

var _user = require("../../entities/user.entity");

class FindUserService {
  async execute(userData) {
    const {
      name = '',
      username = '',
      email = '',
      isDeleted = false,
      offset = 0,
      isAscending = false,
      limit = 20
    } = userData;
    const filters = Object.entries(userData).filter(([, value]) => value);
    const query = Object.fromEntries(filters);
    delete query.isDeleted;
    delete query.offset;
    delete query.isAscending;
    delete query.limit;
    const users = await _database.dataSource.manager.findAndCount(_user.User, {
      where: [{ ...query,
        name: (0, _typeorm.ILike)(`%${name}%`),
        username: (0, _typeorm.ILike)(`%${username}%`),
        email: (0, _typeorm.ILike)(`%${email}%`)
      }],
      loadEagerRelations: true,
      withDeleted: isDeleted,
      take: limit,
      skip: offset,
      order: {
        name: isAscending ? 'ASC' : 'DESC'
      }
    });
    return users;
  }

}

exports.FindUserService = FindUserService;