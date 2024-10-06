import { registerAs } from '@nestjs/config';

export default registerAs('youtube', () => ({
  apiKey: process.env.YOUTUBE_API_KEY || 'defaultApiKey',
  apiV3Url:
    process.env.YOUTUBE_API_V3_URL || 'https://www.googleapis.com/youtube/v3',
}));
