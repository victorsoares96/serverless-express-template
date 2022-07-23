'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.handler = void 0;

require('source-map-support/register');

var _serverlessExpress = _interopRequireDefault(
  require('@vendia/serverless-express'),
);

var _app = _interopRequireDefault(require('./app'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const handler = (0, _serverlessExpress.default)({
  app: _app.default,
});
exports.handler = handler;
