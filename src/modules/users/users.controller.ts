import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from 'src/database';

import { SendOtpDto } from './dto/send_otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UsersService } from './users.services';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'API send OTP' })
  @ApiBody({
    type: SendOtpDto,
    required: true,
    description: 'Send OTP',
  })
  @Post('send-otp')
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    const { email } = sendOtpDto;
    const updatedUser = await this.usersService.sendOtp(email);
    return {
      message: 'OTP sent successfully',
      data: updatedUser,
    };
  }

  @ApiOperation({ summary: 'API Verify OTP' })
  @ApiBody({
    type: SendOtpDto,
    required: true,
    description: 'Send OTP',
  })
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<User> {
    return this.usersService.verifyOtp(verifyOtpDto);
  }
}
