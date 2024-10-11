import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { Queue } from 'bull';
import { Op } from 'sequelize';
import { UserRole } from 'src/constants';
import {
  accessTime,
  accessTokenCode,
  refreshTime,
  refreshTokenCode,
} from 'src/constants/enums/const';
import { Store, User } from 'src/database';
import { AuthResponse } from 'src/interfaces/auth.interface';
import { SendEmailHelper } from 'src/utils';
import { generateOtpCode } from 'src/utils/otp/otp.util';

import { LoginWithPhoneDto } from './dto/login-phone.dto';
import { CreateAdminDto } from './dto/register-admin.dto';
import { RegisterStoreDto } from './dto/register-store.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Store) private storeModel: typeof Store,
    @InjectQueue('mail') private emailQueue: Queue,
    private readonly jwtService: JwtService,
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

  async registerUser(registerDto: RegisterUserDto): Promise<User> {
    try {
      const { username, email, phoneNumber, password, firstName, lastName } =
        registerDto;

      const existingUser = await this.userModel.findOne({
        where: {
          [Op.or]: [{ email }, { phoneNumber }, { username }],
        },
      });

      if (existingUser) {
        throw new BadRequestException('User already in exist');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const { otpCode, expiredAt } = generateOtpCode();

      await this.userModel.create({
        username,
        email,
        phoneNumber,
        password: hashedPassword,
        firstName,
        lastName,
        otpCode,
        expiredAt,
        isActive: false,
      });

      await SendEmailHelper.sendOTP({
        to: email,
        subject: 'Your OTP Code',
        OTP: otpCode,
      });

      return await this.userModel.findOne({
        where: { email },
        attributes: { exclude: ['password', 'otpCode', 'expiredAt'] },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to register user: ${error.message}`,
      );
    }
  }

  async registerStore(registerDto: RegisterStoreDto): Promise<Store> {
    try {
      const { name, email, password } = registerDto;

      const existingUser = await this.storeModel.findOne({
        where: {
          [Op.or]: [{ email }, { name }],
        },
      });

      if (existingUser) {
        throw new BadRequestException('Store already in exist');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const { otpCode, expiredAt } = generateOtpCode();

      await this.storeModel.create({
        name,
        email,
        password: hashedPassword,
        otpCode,
        expiredAt,
        isApproved: false,
        isActive: false,
      });

      await SendEmailHelper.sendOTP({
        to: email,
        subject: 'Your OTP Code',
        OTP: otpCode,
      });

      return await this.storeModel.findOne({
        where: { email },
        attributes: { exclude: ['password', 'otpCode', 'expiredAt'] },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to register user: ${error.message}`,
      );
    }
  }

  async loginWithPhone(body: LoginWithPhoneDto): Promise<AuthResponse> {
    try {
      const { phoneNumber, password } = body;

      const user = await this.userModel.findOne({
        where: { phoneNumber, isActive: true },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }
      

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid password');
      }

      const payload = { email: user.email, role: user.role, sub: user.id };

      const accessToken = this.jwtService.sign(payload, {
        secret: accessTokenCode,
        expiresIn: accessTime,
      });

      const refreshToken = this.jwtService.sign(payload, {
        secret: refreshTokenCode,
        expiresIn: refreshTime,
      });


      return {
        accessToken,
        refreshToken,
        user: await this.userModel.findOne({
          where: { phoneNumber, isActive: true },
          attributes: { exclude: ['password'] },
        }),
      };
    } catch (error) {
      throw new BadRequestException(`Failed to login user: ${error.message}`);
    }
  }
}
