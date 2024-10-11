import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Store, User } from 'src/database';
import { ResponseMessage } from 'src/utils/decorators/customize';


import { AuthService } from './auth.service';
import { LoginWithPhoneDto } from './dto/login-phone.dto';
import { CreateAdminDto } from './dto/register-admin.dto';
import { RegisterStoreDto } from './dto/register-store.dto';
import { RegisterUserDto } from './dto/register-user.dto';

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
  async loginWithPhone(@Body() loginWithPhoneDto: LoginWithPhoneDto) {
    return this.authService.loginWithPhone(loginWithPhoneDto);
  }
}
