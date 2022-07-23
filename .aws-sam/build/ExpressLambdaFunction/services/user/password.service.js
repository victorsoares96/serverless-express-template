"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PasswordService = void 0;

var _bcryptjs = require("bcryptjs");

var _database = require("../../database");

var _AppError = require("../../errors/AppError");

var _user = require("../../entities/user.entity");

class PasswordService {
  async reset({
    id,
    currentPassword,
    newPassword
  }) {
    if (!id) throw new _AppError.AppError('The user id must be provided.');
    if (!currentPassword) throw new _AppError.AppError('The current password must be provided.');
    if (!newPassword) throw new _AppError.AppError('The new password must be provided.');
    const user = await _database.dataSource.manager.findOne(_user.User, {
      where: {
        id
      }
    });
    if (!user) throw new _AppError.AppError('The user does not exist.');
    const isValid = await (0, _bcryptjs.compare)(currentPassword, user.password);
    if (!isValid) throw new _AppError.AppError('The current password is invalid.');

    if (!_user.passwordRule.test(newPassword)) {
      throw new _AppError.AppError('Password must be at least 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.');
    }

    const hashedPassword = await (0, _bcryptjs.hash)(newPassword, 8);
    user.password = hashedPassword;
    await _database.dataSource.manager.save(user);
  }

}

exports.PasswordService = PasswordService;