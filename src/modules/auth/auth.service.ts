import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { UserRole } from 'src/constants';
import { User } from 'src/database';
import { generateOtpCode } from 'src/utils/otp/otp.util';

import { TwilioService } from '../twilio/twilio.service';

import { CreateAdminDto } from './dto/register-admin.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    private twilioService: TwilioService,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto): Promise<User> {
    try {
      const { username, email, phoneNumber, password, firstName, lastName } =
        createAdminDto;

      const existingUser = await this.userModel.findOne({
        where: {
          [Op.or]: [{ email }, { phoneNumber }, { username }],
        },
      });

      if (existingUser) {
        throw new BadRequestException('Admin already exists.');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const adminUser = await this.userModel.create({
        username,
        email,
        phoneNumber,
        password: hashedPassword,
        firstName,
        lastName,
        role: UserRole.ADMIN,
        isActive: true,
      });

      return adminUser;
    } catch (error) {
      throw new BadRequestException(`Failed to create admin: ${error.message}`);
    }
  }

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
      await user.save();

      return user;
    } catch (error) {
      throw new BadRequestException(`Failed to verify OTP: ${error.message}`);
    }
  }

  async sendOtp(email: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ where: { email } });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const { otpCode, expiredAt } = generateOtpCode();

      user.otpCode = otpCode;
      user.expiredAt = expiredAt;
      await user.save();

      await this.twilioService.sendSms(
        user.phoneNumber,
        `Your new OTP code is ${otpCode}`,
      );

      return user;
    } catch (error) {
      throw new BadRequestException(`Failed to re-send OTP ${error.message}`);
    }
  }
}
