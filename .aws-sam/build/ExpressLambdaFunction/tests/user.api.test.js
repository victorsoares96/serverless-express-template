"use strict";

var _chai = require("chai");

var _supertest = _interopRequireDefault(require("supertest"));

var _mocha = require("mocha");

var _app = _interopRequireDefault(require("../app"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _mocha.describe)('activities api', () => {
  (0, _mocha.describe)('GET /users', () => {
    (0, _mocha.it)('returns users list with status 200', async () => {
      const result = await (0, _supertest.default)(_app.default).get('/users');
      (0, _chai.expect)(result.status).to.equal(200);
      (0, _chai.expect)(result.body).deep.equal([{
        id: 1,
        name: 'Joe'
      }, {
        id: 2,
        name: 'Jane'
      }]);
    });
  });
  (0, _mocha.describe)('GET /users/:userId', () => {
    (0, _mocha.it)('returns user 1 with status code 200', async () => {
      const result = await (0, _supertest.default)(_app.default).get('/users/1');
      (0, _chai.expect)(result.status).to.equal(200);
      (0, _chai.expect)(result.body).deep.equal({
        id: 1,
        name: 'Joe'
      });
    });
    (0, _mocha.it)('returns empty body with status code 404', async () => {
      const result = await (0, _supertest.default)(_app.default).get('/users/10');
      (0, _chai.expect)(result.status).to.equal(404);
      (0, _chai.expect)(result.body).deep.equal({});
    });
  });
});