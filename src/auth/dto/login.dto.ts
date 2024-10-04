import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { IsStringNotContains } from '../../common/custom-validator/is-string-not-contains.validator';
import { RegisterDto } from './register.dto';

export class LoginDto extends RegisterDto {
  @ApiProperty({ example: 'Password123@' })
  @IsNotEmpty()
  @IsStringNotContains(' ', { message: 'Password should not contain spaces' })
  @MinLength(8)
  @MaxLength(20)
  password: string;
}
