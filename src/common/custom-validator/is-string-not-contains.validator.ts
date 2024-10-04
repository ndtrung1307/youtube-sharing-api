import {
  ValidationArguments,
  ValidationOptions,
  isString,
  registerDecorator,
} from 'class-validator';

export function IsStringNotContains(
  substring: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStringNotContains',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [substring],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [substring] = args.constraints;
          return isString(value) && !value.includes(substring);
        },
      },
    });
  };
}
