import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignUpUserDto } from './dto/signUpUser.dto';
import { SignInUserDto } from './dto/signInUser.dto';
import { SuccessType } from '../../enum/successType.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** 사용자 회원가입*/
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpUserDto: SignUpUserDto) {
    // 중복된 사용자 존재 여부 확인
    await this.authService.checkUserExists(signUpUserDto.username);

    await this.authService.checkPasswordValidate(
      signUpUserDto.password,
      signUpUserDto.confirmPassword,
    );

    const user = await this.authService.createUser(signUpUserDto);

    return {
      message: SuccessType.USER_SIGN_UP,
      data: user.username,
    };
  }

  /** 사용자 로그인*/
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInUserDto: SignInUserDto, @Res() res: Response) {
    const verifiedUser = await this.authService.verifyUser(signInUserDto);

    const payload = { id: verifiedUser.id, username: verifiedUser.username };
    const accessToken = await this.authService.getAccessToken(payload);

    return res.cookie('accessToken', accessToken, { httpOnly: true }).json({
      message: SuccessType.USER_SIGN_IN,
      data: payload,
    });
  }
}
