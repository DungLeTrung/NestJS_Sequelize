import { Injectable } from '@nestjs/common';
import md5 from 'md5';
import moment from 'moment';
import { APPLICATION, HASH, OTP, USER } from 'src/constants';
import { emailSender, token } from 'src/configs';
import {
  CommonHelper,
  EncryptHelper,
  ErrorHelper,
  SendEmailHelper,
  TokenHelper,
} from 'src/utils';
import { IToken } from 'src/interfaces';

import { LoginDto } from './dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async login(body: LoginDto): Promise<object> {
    const { password, email } = body;

    const user = await this.usersRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      ErrorHelper.BadRequestException(USER.USER_NOT_FOUND);
    }
    const isValidPassword = await EncryptHelper.compare(
      password,
      user.password,
    );
    if (!isValidPassword)
      ErrorHelper.BadRequestException(USER.INVALID_PASSWORD);

    const token = this.generateToken({ id: user.id });
    delete user.password;
    return {
      ...token,
      user,
    };
  }

  private generateToken(payload: object): IToken {
    const { token: accessToken, expires } = TokenHelper.generate(
      payload,
      token.secretKey,
      token.expireTime,
    );
    const { token: refreshToken } = TokenHelper.generate(
      payload,
      token.rfSecretKey,
      token.rfExpireTime,
    );

    return {
      accessToken,
      expires,
      refreshToken,
    };
  }

  async sendOTP(email: string, hash: string): Promise<string> {
    const checkHash = md5(
      email + emailSender.secretKeySendGmail + moment().format('DD/MM/YYYY'),
    );
    console.log('check-hash: ', checkHash);

    if (checkHash !== hash) {
      ErrorHelper.InternalServerErrorException(APPLICATION.HASH_IS_NOT_CORRECT);
    }

    const OTP = CommonHelper.generateOTP();
    console.log('OTP: ', OTP);
    SendEmailHelper.sendOTP({
      to: email,
      subject: 'Confirm OTP',
      OTP,
    });

    const hashCode = CommonHelper.hashData(
      JSON.stringify({
        otp: OTP,
        time: moment().add(emailSender.otpTimeExpire, 'second').valueOf(),
        email,
        isVerified: false,
      }),
    );
    return hashCode;
  }

  async verifyOTP(otp: string, hash: string): Promise<string> {
    const checkHashInfo = CommonHelper.checkHashData(hash);
    if (!checkHashInfo) {
      ErrorHelper.BadRequestException(APPLICATION.VERIFY_FAIL);
    }

    const hashInfo = JSON.parse(checkHashInfo);
    if (hashInfo.time < new Date().getTime()) {
      ErrorHelper.InternalServerErrorException(OTP.OTP_TIMEOUT);
    }

    if (otp !== hashInfo.otp) {
      ErrorHelper.InternalServerErrorException(OTP.OTP_INVALID);
    }

    const hashCode = CommonHelper.hashData(
      JSON.stringify({
        time: moment().add(emailSender.otpTimeExpire, 'second').valueOf(),
        email: hashInfo.email,
        isVerified: true,
      }),
    );

    return hashCode;
  }

  async forgetPassword(newPassword: string, hash: string): Promise<boolean> {
    const checkHashInfo = CommonHelper.checkHashData(hash);
    if (!checkHashInfo) {
      ErrorHelper.BadRequestException(APPLICATION.VERIFY_FAIL);
    }
    const hashInfo = JSON.parse(checkHashInfo);
    if (hashInfo.time < new Date().getTime()) {
      ErrorHelper.InternalServerErrorException(
        USER.EXPIRE_TIME_CHANGE_PASSWORD,
      );
    }
    if (!hashInfo.isVerified) {
      ErrorHelper.InternalServerErrorException(HASH.UNVERIFIED_HASH);
    }
    const userInfo = await this.usersRepository.findOne({
      where: {
        email: hashInfo.email,
      },
    });
    if (!userInfo)
      throw ErrorHelper.InternalServerErrorException(USER.USER_NOT_FOUND);

    const hashPassword = await EncryptHelper.hash(newPassword);
    await this.usersRepository.update(
      {
        password: hashPassword,
      },
      {
        where: {
          email: hashInfo.email,
        },
      },
    );

    return true;
  }
}
