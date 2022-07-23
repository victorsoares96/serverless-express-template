"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.passwordRule = exports.User = void 0;

var _typeorm = require("typeorm");

var _classValidator = require("class-validator");

var _isValidPassword = require("./decorators/isValidPassword");

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8;

function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/gm;
exports.passwordRule = passwordRule;
let User = (_dec = (0, _typeorm.Entity)('user'), _dec2 = (0, _typeorm.PrimaryGeneratedColumn)('increment'), _dec3 = Reflect.metadata("design:type", String), _dec4 = (0, _typeorm.Column)({
  name: 'name'
}), _dec5 = (0, _classValidator.IsNotEmpty)({
  message: 'Name is required.'
}), _dec6 = Reflect.metadata("design:type", String), _dec7 = (0, _typeorm.CreateDateColumn)({
  name: 'created_at'
}), _dec8 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec9 = (0, _typeorm.UpdateDateColumn)({
  name: 'updated_at'
}), _dec10 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec11 = (0, _typeorm.DeleteDateColumn)({
  name: 'deletion_date'
}), _dec12 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec13 = (0, _typeorm.Column)({
  name: 'username',
  unique: true
}), _dec14 = (0, _classValidator.MinLength)(5, {
  message: 'Username is too short.'
}), _dec15 = (0, _classValidator.MaxLength)(15, {
  message: 'Username is too long.'
}), _dec16 = Reflect.metadata("design:type", String), _dec17 = (0, _typeorm.Column)({
  name: 'email',
  unique: true
}), _dec18 = (0, _classValidator.IsNotEmpty)({
  message: 'Email is required.'
}), _dec19 = (0, _classValidator.IsEmail)({}, {
  message: 'Email is invalid.'
}), _dec20 = Reflect.metadata("design:type", String), _dec21 = (0, _typeorm.Column)({
  name: 'password'
}), _dec22 = (0, _classValidator.IsNotEmpty)({
  message: 'Password is required.'
}), _dec23 = (0, _isValidPassword.IsValidPassword)({
  message: 'Password must be at least 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.'
}), _dec24 = Reflect.metadata("design:type", String), _dec(_class = (_class2 = class User {
  constructor() {
    _initializerDefineProperty(this, "id", _descriptor, this);

    _initializerDefineProperty(this, "name", _descriptor2, this);

    _initializerDefineProperty(this, "createdAt", _descriptor3, this);

    _initializerDefineProperty(this, "updatedAt", _descriptor4, this);

    _initializerDefineProperty(this, "deletionDate", _descriptor5, this);

    _initializerDefineProperty(this, "username", _descriptor6, this);

    _initializerDefineProperty(this, "email", _descriptor7, this);

    _initializerDefineProperty(this, "password", _descriptor8, this);
  }

}, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2, _dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "name", [_dec4, _dec5, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "createdAt", [_dec7, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "updatedAt", [_dec9, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "deletionDate", [_dec11, _dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "username", [_dec13, _dec14, _dec15, _dec16], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "email", [_dec17, _dec18, _dec19, _dec20], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "password", [_dec21, _dec22, _dec23, _dec24], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class2)) || _class);
exports.User = User;