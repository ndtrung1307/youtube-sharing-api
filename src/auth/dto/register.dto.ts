import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';
import { IsStringNotContains } from 'src/common/custom-validator/is-string-not-contains.validator';
import { IsStrongPassword } from 'src/common/custom-validator/is-strong-password.validator';

export class RegisterDto {
  @ApiProperty({ example: 'validEmail@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123@' })
  @IsStrongPassword()
  @IsStringNotContains(' ', { message: 'Password should not contain spaces' })
  @MaxLength(20)
  password: string;
}
