import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Queue } from 'bull';
import { Op, WhereOptions } from 'sequelize';
import { Reward, Store } from 'src/database';
import { SendEmailHelper } from 'src/utils';
import { PaginatedResult, PaginateDto } from 'src/utils/decorators/paginate';
import { generateOtpCode } from 'src/utils/otp/otp.util';

import { UpdateStoreDto } from './dto/update-store.dto';
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
        attributes: { exclude: ['password'] },
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

      const updatedStore = await this.storeModel.findOne({
        where: { email },
        attributes: { exclude: ['password', 'otpCode', 'expiredAt'] },
      });

      await SendEmailHelper.sendOTP({
        to: email,
        subject: 'Your OTP Code',
        OTP: otpCode,
      });

      return updatedStore;
    } catch (error) {
      throw new BadRequestException(`Failed to re-send OTP: ${error.message}`);
    }
  }

  async approveStore(storeId: string): Promise<Store> {
    try {
      const store = await this.storeModel.findOne({ where: { id: storeId } });
      if (!store) {
        throw new NotFoundException('Store not found');
      }

      await this.storeModel.update(
        { isApproved: true },
        { where: { id: storeId } },
      );

      return await this.storeModel.findOne({
        where: { id: storeId },
        attributes: { exclude: ['password', 'otpCode', 'expiredAt'] },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to approve store: ${error.message}`,
      );
    }
  }

  async findById(id: string): Promise<Store> {
    try {
      const store = await this.storeModel.findOne({ where: { id } });
      if (!store) {
        throw new NotFoundException('Store not found');
      }

      const secureStore = await this.storeModel.findOne({
        where: { id },
        attributes: { exclude: ['password', 'otpCode', 'expiredAt'] },
      });
      return secureStore;
    } catch (error) {
      throw new BadRequestException(`Can not find store: ${error.message}`);
    }
  }

  async getAll(paginateDto: PaginateDto): Promise<PaginatedResult<Store>> {
    try {
      const {
        page = 1,
        limit,
        sortBy = 'id',
        sortOrder = 'ASC',
        filters = {},
      } = paginateDto;

      const filterConditions: WhereOptions = {};

      if (filters && typeof filters === 'object') {
        for (const [key, value] of Object.entries(filters)) {
          if (key === 'isApproved' || key === 'isActive') {
            filterConditions[key as keyof Store] = value;
          } else if (typeof value === 'string') {
            filterConditions[key as keyof Store] = { [Op.like]: `%${value}%` };
          } else {
            filterConditions[key as keyof Store] = value;
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

      const totalItems = await this.storeModel.count({
        where: filterConditions,
      });
      const totalPages = Math.ceil(totalItems / limit);

      const result = await this.storeModel.findAll({
        attributes: [
          'id',
          'email',
          'name',
          'rewards',
          'isActive',
          'isApproved',
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

  async delete(id: string): Promise<string> {
    try {
      const store = await this.storeModel.findOne({ where: { id } });
      if (!store) {
        throw new NotFoundException(`Store with id ${id} not found`);
      }

      await this.storeModel.destroy({ where: { id } });

      return `Store with id ${id} has been deleted successfully`;
    } catch (error) {
      throw new BadRequestException(`Failed to delete store: ${error.message}`);
    }
  }

  async update(
    storeId: string,
    updateStoreDto: UpdateStoreDto,
    id: number,
  ): Promise<Store> {
    try {
      const store = await this.storeModel.findOne({ where: { id: storeId } });

      if (!store) {
        throw new NotFoundException(`Store with id ${storeId} not found`);
      }

      if (!(+storeId == id)) {
        throw new NotFoundException(`Store is not permission`);
      }

      await this.storeModel.update(updateStoreDto, { where: { id } });

      const updatedStore = await this.storeModel.findOne({
        where: { id },
        attributes: { exclude: ['password', 'otpCode', 'expiredAt'] },
      });

      return updatedStore;
    } catch (error) {
      throw new BadRequestException(`Failed to update store: ${error.message}`);
    }
  }
}
