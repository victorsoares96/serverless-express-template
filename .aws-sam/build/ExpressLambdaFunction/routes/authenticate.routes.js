'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.authenticateRouter = void 0;

var _express = require('express');

var _authenticate = require('../controllers/authenticate.controller');

const authenticateRouter = (0, _express.Router)();
exports.authenticateRouter = authenticateRouter;
const authenticateController = new _authenticate.AuthenticateController();
authenticateRouter.post('/auth', authenticateController.execute);
