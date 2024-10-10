import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { UserRole } from 'src/constants';
import { User } from 'src/database';

import { TwilioService } from '../twilio/twilio.service';

import { CreateAdminDto } from './dto/register-admin.dto';

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
          [Op.or]: [{ email }, { phoneNumber }],
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
}
