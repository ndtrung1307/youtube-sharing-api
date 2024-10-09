import { ValidationOptions, registerDecorator } from 'class-validator';
import { youtubeURLRegex } from '../regex';

export function IsValidYouTubeUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidYouTubeUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && youtubeURLRegex.test(value);
        },
        defaultMessage() {
          return 'url must be a valid youtube url';
        },
      },
    });
  };
}
