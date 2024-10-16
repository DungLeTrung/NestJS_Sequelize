import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Queue } from 'bull';
import { Op, Sequelize, WhereOptions } from 'sequelize';
import { UserRole } from 'src/constants';
import { User } from 'src/database';
import { SendEmailHelper } from 'src/utils';
import { PaginatedResult, PaginateDto } from 'src/utils/decorators/paginate';
import { generateOtpCode } from 'src/utils/otp/otp.util';

import { UpdateUserDto } from './dto/update-user.dto';
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
        { isVerify: true, otpCode: null, expiredAt: null },
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

      if (user.isVerify) {
        throw new BadRequestException(
          'Account is already verify, no need to send OTP',
        );
      }

      const { otpCode, expiredAt } = generateOtpCode();

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

      const secureUser = await this.userModel.findOne({
        where: { id },
        attributes: { exclude: ['password', 'otpCode', 'expiredAt'] },
      });
      return secureUser;
    } catch (error) {
      throw new BadRequestException(`Can not find user: ${error.message}`);
    }
  }

  async getAll(paginateDto: PaginateDto): Promise<PaginatedResult<User>> {
    try {
      const {
        page = 1,
        limit,
        sortBy = 'id',
        sortOrder = 'ASC',
        filters = {},
      } = paginateDto;

      const filterConditions: WhereOptions = {
        role: { [Op.ne]: UserRole.ADMIN },
      };

      if (filters && typeof filters === 'object') {
        for (const [key, value] of Object.entries(filters)) {
          if (key === 'fullName' && typeof value === 'string') {
            const cleanedValue = value.trim();
            filterConditions[Op.or as unknown as keyof WhereOptions<User>] = [
              Sequelize.where(
                Sequelize.fn(
                  'concat',
                  Sequelize.col('first_name'),
                  ' ',
                  Sequelize.col('last_name'),
                ),
                { [Op.like]: `%${cleanedValue}%` },
              ),
            ];
          } else if (key === 'role' || key === 'isActive') {
            filterConditions[key as keyof User] = value;
          } else if (typeof value === 'string') {
            filterConditions[key as keyof User] = { [Op.like]: `%${value}%` };
          } else {
            filterConditions[key as keyof User] = value;
          }
        }
      }

      const isPaginationEnabled = !!page && !!limit;
      let offset = 0;

      if (isPaginationEnabled) {
        offset = (page - 1) * limit;

        if (isNaN(offset) || isNaN(limit)) {
          throw new BadRequestException(
            "Provided 'skip' or 'limit' value is not a number.",
          );
        }
      }

      const totalItems = await this.userModel.count({
        where: filterConditions,
      });
      const totalPages = Math.ceil(totalItems / limit);

      const result = await this.userModel.findAll({
        attributes: [
          'id',
          'email',
          'username',
          'firstName',
          'lastName',
          'phoneNumber',
          'role',
          'isActive',
          'createdAt',
          'updatedAt',
        ],
        where: filterConditions,
        offset: isPaginationEnabled ? offset : undefined,
        limit: isPaginationEnabled ? limit : undefined,
        order: [[sortBy, sortOrder]],
      });

      return {
        result,
        records: {
          page,
          limit,
          totalPages,
          totalItems,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Error in findAll: ${error.message}`);
    }
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
    id: number,
  ): Promise<User> {
    try {
      const user = await this.userModel.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }

      if (!(+userId == id)) {
        throw new NotFoundException(`User is not permission`);
      }

      await this.userModel.update(updateUserDto, { where: { id } });

      const updatedUser = await this.userModel.findOne({
        where: { id },
        attributes: { exclude: ['password', 'otpCode', 'expiredAt'] },
      });

      return updatedUser;
    } catch (error) {
      throw new BadRequestException(`Failed to update user: ${error.message}`);
    }
  }

  async delete(id: string): Promise<string> {
    try {
      const user = await this.userModel.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      await this.userModel.destroy({ where: { id } });

      return `User with id ${id} has been deleted successfully`;
    } catch (error) {
      throw new BadRequestException(`Failed to delete user: ${error.message}`);
    }
  }

  async activeUser(id: number): Promise<User> {
    try {
      const user = await this.userModel.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const newIsActiveStatus = !user.isActive;

      
      await this.userModel.update(
        { isActive: newIsActiveStatus },
        { where: { id } },
      );

      return await this.userModel.findOne({
        where: { id },
        attributes: { exclude: ['password', 'otpCode', 'expiredAt'] },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to active/deactive user: ${error.message}`,
      );
    }
  }
}
