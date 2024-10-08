import { comparePassword, hashPassword } from './hash.utils';

describe('Hash Utils', () => {
  const password = 'testPassword';
  let hashedPassword: string;

  it('should hash the password', async () => {
    hashedPassword = await hashPassword(password);
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toEqual(password);
  });

  it('should compare the password correctly', async () => {
    const isMatch = await comparePassword(password, hashedPassword);
    expect(isMatch).toBe(true);
  });

  it('should fail to compare the password with a wrong hash', async () => {
    const isMatch = await comparePassword('wrongPassword', hashedPassword);
    expect(isMatch).toBe(false);
  });
});
