'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.dataSource = exports.AppDataSourceInitialize = void 0;

require('reflect-metadata');

var _typeorm = require('typeorm');

var _config = _interopRequireDefault(require('./config'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const dataSource = new _typeorm.DataSource(_config.default);
exports.dataSource = dataSource;

const AppDataSourceInitialize = async () => {
  await dataSource.initialize();
};

exports.AppDataSourceInitialize = AppDataSourceInitialize;
