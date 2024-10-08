import { validate } from 'class-validator';
import { IsStrongPassword } from './is-strong-password.validator';

class TestClass {
  @IsStrongPassword({ message: 'Password is not strong enough' })
  password: string;
}

describe('IsStrongPassword', () => {
  it('should pass validation for a strong password', async () => {
    const testInstance = new TestClass();
    testInstance.password = 'Str0ngP@ssw0rd!';

    const errors = await validate(testInstance);
    expect(errors.length).toBe(0);
  });

  it('should fail validation for a weak password', async () => {
    const testInstance = new TestClass();
    testInstance.password = 'weakpassword';

    const errors = await validate(testInstance);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toEqual({
      isStrongPassword: 'Password is not strong enough',
    });
  });

  it('should fail validation for a non-string value', async () => {
    const testInstance = new TestClass();
    testInstance.password = 12345 as any;

    const errors = await validate(testInstance);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toEqual({
      isStrongPassword: 'Password is not strong enough',
    });
  });
});
