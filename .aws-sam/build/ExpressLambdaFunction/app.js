"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("reflect-metadata");

var _cors = _interopRequireDefault(require("cors"));

var _express = _interopRequireDefault(require("express"));

require("express-async-errors");

var _compression = _interopRequireDefault(require("compression"));

var _errorHandler = require("./middlewares/errorHandler.middleware");

var _handleConnectionToDatabase = _interopRequireDefault(require("./middlewares/handleConnectionToDatabase.middleware"));

var _users = require("./routes/users.routes");

var _authenticate = require("./routes/authenticate.routes");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class App {
  constructor() {
    this.express = void 0;
    this.express = (0, _express.default)();
    this.express.use((0, _compression.default)());
    this.express.use((0, _cors.default)());
    this.express.use(_express.default.json());
    this.express.use(_express.default.json({
      limit: '5mb'
    }));
    this.express.use(_express.default.urlencoded({
      limit: '5mb',
      extended: true
    }));
    this.routeLevelMiddlewares();
    this.routes();
    this.errorHandlerMiddlewares();
  }

  routeLevelMiddlewares() {
    this.express.use(_handleConnectionToDatabase.default);
  }

  errorHandlerMiddlewares() {
    this.express.use(_errorHandler.errorHandler);
  }

  routes() {
    this.express.use(_authenticate.authenticateRouter);
    this.express.use(_users.usersRouter);
  }

}

var _default = new App().express;
exports.default = _default;