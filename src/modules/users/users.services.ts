import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Queue } from 'bull';
import { User } from 'src/database';
import { generateOtpCode } from 'src/utils/otp/otp.util';

import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectQueue('mail') private emailQueue: Queue,
  ) {}

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<User> {
    try {
      const { email, otpCode } = verifyOtpDto;

      const user = await this.userModel.findOne({
        where: { email },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.otpCode !== otpCode) {
        throw new BadRequestException('Invalid OTP code');
      }

      if (new Date() > user.expiredAt) {
        throw new BadRequestException('OTP code has expired');
      }

      user.isActive = true;
      user.otpCode = null;
      user.expiredAt = null;
      await this.userModel.update(
        { isActive: true, otpCode: null, expiredAt: null },
        { where: { email } },
      );
      return await this.userModel.findOne({
        where: { email },
        attributes: { exclude: ['password', 'otpCode', 'expiredAt'] },
      });
    } catch (error) {
      throw new BadRequestException(`Failed to verify OTP: ${error.message}`);
    }
  }

  async sendOtp(email: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({
        where: { email },
        attributes: { exclude: ['password', 'otpCode', 'expiredAt'] },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.isActive) {
        throw new BadRequestException('Account is already active, no need to send OTP');
      }

      const { otpCode, expiredAt } = generateOtpCode();

      user.otpCode = otpCode;
      user.expiredAt = expiredAt;
      await this.userModel.update({ otpCode, expiredAt }, { where: { email } });

      const updatedUser = await this.userModel.findOne({
        where: { email },
        attributes: { exclude: ['password', 'otpCode', 'expiredAt'] },
      });

      await this.emailQueue.add({
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otpCode}`,
      });

      return updatedUser;
    } catch (error) {
      throw new BadRequestException(`Failed to re-send OTP ${error.message}`);
    }
  }
}
