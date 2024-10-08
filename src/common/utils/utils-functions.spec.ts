import { extractVideoId } from './utils-functions';

describe('Utils Functions', () => {
  describe('extractVideoId', () => {
    it('should extract video ID from a valid YouTube URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const videoId = extractVideoId(url);
      expect(videoId).toBe('dQw4w9WgXcQ');
    });

    it('should return null for an invalid YouTube URL', () => {
      const url = 'https://www.invalidurl.com/watch?v=dQw4w9WgXcQ';
      const videoId = extractVideoId(url);
      expect(videoId).toBeNull();
    });

    it('should return null for a URL without a video ID', () => {
      const url = 'https://www.youtube.com/watch';
      const videoId = extractVideoId(url);
      expect(videoId).toBeNull();
    });
  });
});
