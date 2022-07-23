"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthenticateController = void 0;

var _authenticate = require("../services/authenticate/authenticate.service");

class AuthenticateController {
  async execute(request, response) {
    const {
      username,
      password
    } = request.body;
    const authenticate = new _authenticate.AuthenticateService();
    const data = await authenticate.execute({
      username,
      password
    });
    return response.json(data);
  }

}

exports.AuthenticateController = AuthenticateController;