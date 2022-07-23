'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.usersRouter = void 0;

var _express = require('express');

var _ensureAuthenticated = _interopRequireDefault(
  require('../middlewares/ensureAuthenticated.middleware'),
);

var _user = require('../controllers/user.controller');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const usersRouter = (0, _express.Router)();
exports.usersRouter = usersRouter;
const usersController = new _user.UsersController();
usersRouter.get('/users', _ensureAuthenticated.default, usersController.index);
usersRouter.post(
  '/users',
  /* ensureAuthenticated, */
  usersController.create,
);
usersRouter.put('/users', _ensureAuthenticated.default, usersController.update);
usersRouter.delete(
  '/users/remove',
  _ensureAuthenticated.default,
  usersController.remove,
);
usersRouter.patch('/users/password', usersController.resetPassword);
