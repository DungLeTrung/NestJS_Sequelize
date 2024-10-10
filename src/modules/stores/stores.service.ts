import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Queue } from 'bull';
import { Store } from 'src/database';
import { SendEmailHelper } from 'src/utils';
import { generateOtpCode } from 'src/utils/otp/otp.util';

import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectModel(Store) private storeModel: typeof Store,
    @InjectQueue('mail') private emailQueue: Queue,
  ) {}

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<Store> {
    try {
      const { email, otpCode } = verifyOtpDto;

      const store = await this.storeModel.findOne({
        where: { email },
      });

      if (!store) {
        throw new BadRequestException('Store not found');
      }

      if (store.otpCode !== otpCode) {
        throw new BadRequestException('Invalid OTP code');
      }

      if (new Date() > store.expiredAt) {
        throw new BadRequestException('OTP code has expired');
      }

      store.isActive = true;
      store.otpCode = null;
      store.expiredAt = null;
      await this.storeModel.update(
        { isActive: true, otpCode: null, expiredAt: null },
        { where: { email } },
      );
      return await this.storeModel.findOne({
        where: { email },
        attributes: { exclude: ['password', 'otpCode', 'expiredAt'] },
      });
    } catch (error) {
      throw new BadRequestException(`Failed to verify OTP: ${error.message}`);
    }
  }

  async sendOtp(email: string): Promise<Store> {
    try {
      const store = await this.storeModel.findOne({
        where: { email },
        attributes: { exclude: ['password', 'otpCode', 'expiredAt'] },
      });

      if (!store) {
        throw new BadRequestException('Store not found');
      }

      if (store.isActive) {
        throw new BadRequestException(
          'Store is already active, no need to send OTP',
        );
      }

      const { otpCode, expiredAt } = generateOtpCode();

      store.otpCode = otpCode;
      store.expiredAt = expiredAt;
      await this.storeModel.update(
        { otpCode, expiredAt },
        { where: { email } },
      );

      const updatedUser = await this.storeModel.findOne({
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
      throw new BadRequestException(`Failed to re-send OTP: ${error.message}`);
    }
  }
}
