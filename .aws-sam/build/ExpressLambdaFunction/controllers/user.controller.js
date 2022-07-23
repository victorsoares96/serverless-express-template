"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UsersController = void 0;

var _update = require("../services/user/update.service");

var _create = require("../services/user/create.service");

var _find = require("../services/user/find.service");

var _recover = require("../services/user/recover.service");

var _remove = require("../services/user/remove.service");

var _password = require("../services/user/password.service");

/* eslint-disable @typescript-eslint/ban-ts-comment */
class UsersController {
  async create(request, response) {
    const {
      name,
      username,
      email,
      password
    } = request.body;
    const createUser = new _create.CreateUserService();
    const user = await createUser.execute({
      name,
      username,
      email,
      password
    });
    return response.json(user);
  }

  async index(request, response) {
    const filters = request.body;
    const findUsers = new _find.FindUserService();
    const users = await findUsers.execute(filters);
    return response.json(users);
  }

  async recover(request, response) {
    const {
      ids
    } = request.body;
    const recoverUsers = new _recover.RecoverUserService();
    await recoverUsers.execute({
      ids
    });
    return response.send();
  }

  async remove(request, response) {
    const {
      ids
    } = request.body;
    const removeUsers = new _remove.RemoveUserService({
      softRemove: false
    });
    await removeUsers.execute({
      ids
    });
    return response.send();
  }

  async softRemove(request, response) {
    const {
      ids
    } = request.body;
    const softRemoveUsers = new _remove.RemoveUserService({
      softRemove: true
    });
    await softRemoveUsers.execute({
      ids
    });
    return response.send();
  }

  async update(request, response) {
    const {
      id,
      name,
      email
    } = request.body;
    const updateUser = new _update.UpdateUserService();
    const user = await updateUser.execute({
      id,
      name,
      email
    });
    return response.json(user);
  }

  async resetPassword(request, response) {
    const {
      id,
      currentPassword,
      newPassword
    } = request.body;
    const password = new _password.PasswordService();
    await password.reset({
      id,
      currentPassword,
      newPassword
    });
    return response.send();
  }

}

exports.UsersController = UsersController;