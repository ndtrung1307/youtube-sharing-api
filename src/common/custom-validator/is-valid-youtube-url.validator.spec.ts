import { validate } from 'class-validator';
import { IsValidYouTubeUrl } from './is-valid-youtube-url.validator';

class TestClass {
  @IsValidYouTubeUrl({ message: 'Invalid YouTube URL' })
  url: string;
}

describe('IsValidYouTubeUrl', () => {
  it('should pass validation for a valid YouTube URL', async () => {
    const testInstance = new TestClass();
    testInstance.url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    const errors = await validate(testInstance);
    expect(errors.length).toBe(0);
  });

  it('should fail validation for an invalid YouTube URL', async () => {
    const testInstance = new TestClass();
    testInstance.url = 'https://www.invalidurl.com/watch?v=dQw4w9WgXcQ';

    const errors = await validate(testInstance);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toEqual({
      isValidYouTubeUrl: 'Invalid YouTube URL',
    });
  });

  it('should fail validation for a non-string value', async () => {
    const testInstance = new TestClass();
    testInstance.url = 12345 as any;

    const errors = await validate(testInstance);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toEqual({
      isValidYouTubeUrl: 'Invalid YouTube URL',
    });
  });

  it('should return the default error message if validation fails', async () => {
    const testInstance = new TestClass();
    testInstance.url = 'invalid-url';

    const errors = await validate(testInstance);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toEqual({
      isValidYouTubeUrl: 'Invalid YouTube URL',
    });
  });
});
