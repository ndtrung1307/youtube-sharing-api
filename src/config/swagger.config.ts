import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => ({
  title: 'Youtube Videos Sharing API',
  description: 'Youtube Videos Sharing API',
}));
