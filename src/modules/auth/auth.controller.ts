import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { User } from 'src/database';
import { ResponseMessage } from 'src/utils/decorators/customize';

import { AuthService } from './auth.service';
import { CreateAdminDto } from './dto/register-admin.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create-admin')
  @ResponseMessage('Create Admin')
  @HttpCode(201)
  async createAdmin(@Body() createAdminDto: CreateAdminDto): Promise<User> {
    return this.authService.createAdmin(createAdminDto);
  }

  @Post('verify-otp')
  @ResponseMessage('Verify OTP')
  @HttpCode(201)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<User> {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('send-otp')
  @ResponseMessage('Send OTP')
  @HttpCode(201)
  async sendOtp(@Body('email') email: string) {
    return this.authService.sendOtp(email);
  }
}
