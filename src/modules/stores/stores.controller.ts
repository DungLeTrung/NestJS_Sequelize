import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { Store } from 'src/database';

import { SendOtpDto } from './dto/send_otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { StoresService } from './stores.service';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @ApiOperation({ summary: 'API send OTP' })
  @ApiBody({
    type: SendOtpDto,
    required: true,
    description: 'Send OTP',
  })
  @Post('send-otp')
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    const { email } = sendOtpDto;
    const updatedUser = await this.storesService.sendOtp(email);
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
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<Store> {
    return this.storesService.verifyOtp(verifyOtpDto);
  }
}
