import { registerAs } from '@nestjs/config';

export default registerAs('api', () => ({
  version: '1.0',
  defaultVersion: ['1.0'],
}));
