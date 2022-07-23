"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = handleConnectionToDatabase;

var _database = require("../database");

var _AppError = require("../errors/AppError");

async function handleConnectionToDatabase(request, response, next) {
  try {
    if (!_database.dataSource.isInitialized) await (0, _database.AppDataSourceInitialize)();
    console.log('📦  Connection to database open!');
    console.log(`[URL]: ${request.url} [METHOD]: ${request.method} [BODY]: ${JSON.stringify(request.body)}`);
    response.on('finish', async () => {
      await _database.dataSource.destroy();
      console.log('📦  Connection to database closed!');
    });
    return next();
  } catch (error) {
    console.log(error);
    throw new _AppError.AppError('❌  Error when initializing the database.', 500);
  }
}