import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { passwordRule } from '@/utils/validators.util';

@ValidatorConstraint()
export class IsValidPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string) {
    const isValidPassword = new RegExp(passwordRule, 'gm');
    return isValidPassword.test(password);
  }
}

export function IsValidPassword(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPasswordConstraint,
    });
  };
}
