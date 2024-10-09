import { ValidationOptions, registerDecorator } from 'class-validator';
import { strongPasswordRegex } from '../regex';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && strongPasswordRegex.test(value);
        },
        defaultMessage() {
          return 'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character';
        },
      },
    });
  };
}
