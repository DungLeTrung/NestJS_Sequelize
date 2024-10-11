import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Queue } from 'bull';
import { User } from 'src/database';
import { SendEmailHelper } from 'src/utils';
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
      const { phoneNumber, otpCode } = verifyOtpDto;

      const user = await this.userModel.findOne({
        where: { phoneNumber },
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

      await this.userModel.update(
        { isActive: true, otpCode: null, expiredAt: null },
        { where: { phoneNumber } },
      );
      
      return await this.userModel.findOne({
        where: { phoneNumber },
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
        throw new BadRequestException(
          'Account is already active, no need to send OTP',
        );
      }

      const { otpCode, expiredAt } = generateOtpCode();

      user.otpCode = otpCode;
      user.expiredAt = expiredAt;
      await this.userModel.update({ otpCode, expiredAt }, { where: { email } });

      const updatedUser = await this.userModel.findOne({
        where: { email },
        attributes: { exclude: ['password', 'otpCode', 'expiredAt'] },
      });

      await SendEmailHelper.sendOTP({
        to: email,
        subject: 'Your OTP Code',
        OTP: otpCode,
      });

      return updatedUser;
    } catch (error) {
      throw new BadRequestException(`Failed to re-send OTP ${error.message}`);
    }
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      throw new BadRequestException('Can not find user', error.message);
    }
  }
}
