import { IsString, MinLength } from 'class-validator';
import { FailType } from '../../../enum/failType.enum';

export class SignUpUserDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(10, { message: FailType.PASSWORD_LENGTH_REQUIRE })
  password!: string;

  @IsString()
  confirmPassword!: string;
}
