import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Store, User } from 'src/database';
import { ResponseMessage } from 'src/utils/decorators/customize';

import { AuthService } from './auth.service';
import { LoginWithEmailDto } from './dto/login-email.dto';
import { LoginWithPhoneDto } from './dto/login-phone.dto';
import { CreateAdminDto } from './dto/register-admin.dto';
import { RegisterStoreDto } from './dto/register-store.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RefreshTokenDTO } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create-admin')
  @ResponseMessage('Create Admin')
  @HttpCode(201)
  async createAdmin(@Body() createAdminDto: CreateAdminDto): Promise<User> {
    return this.authService.createAdmin(createAdminDto);
  }

  @Post('register-user')
  async registerUser(@Body() registerDto: RegisterUserDto): Promise<User> {
    return this.authService.registerUser(registerDto);
  }

  @Post('register-store')
  async registerStore(@Body() registerDto: RegisterStoreDto): Promise<Store> {
    return this.authService.registerStore(registerDto);
  }

  @Post('login-user')
  async loginWithPhone(
    @Body() loginWithPhoneDto: LoginWithPhoneDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.loginWithPhone(loginWithPhoneDto, res);
  }

  @Post('login-store')
  async loginWithEmail(
    @Body() loginWithEmailDto: LoginWithEmailDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.loginWithEmail(loginWithEmailDto, res);
  }

  // @Post('logout')
  // async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  //   return await this.authService.logout(req, res);
  // }

  @Post('refresh-token-user')
  async refreshTokenUser(@Body() refreshTokenDTO: RefreshTokenDTO,  @Res({ passthrough: true }) res: Response) {
    return this.authService.refreshTokenUser(refreshTokenDTO, res);
  }

  @Post('refresh-token-store')
  async refreshTokenStore(@Body() refreshTokenDTO: RefreshTokenDTO,  @Res({ passthrough: true }) res: Response) {
    return this.authService.refreshTokenStore(refreshTokenDTO, res);
  }
}
