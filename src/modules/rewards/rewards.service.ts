import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { Reward, Store } from 'src/database';
import { PaginatedResult, PaginateDto } from 'src/utils/decorators/paginate';

import { CreateRewardDto } from './dto/create-reward.dto';

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(Reward)
    private readonly rewardModel: typeof Reward,
    @InjectModel(Store)
    private readonly storeModel: typeof Store,
  ) {}

  async create(
    createRewardDto: CreateRewardDto,
    storeId: number,
  ): Promise<Reward> {
    try {
      const store = await this.storeModel.findOne({
        where: { id: storeId },
      });

      if (!store) {
        throw new BadRequestException('A store has been disappeared.');
      }

      const existingReward = await this.rewardModel.findOne({
        where: { name: createRewardDto.name },
      });

      if (existingReward) {
        throw new BadRequestException(
          'A reward with this name already exists.',
        );
      }

      const reward = await this.rewardModel.create({
        ...createRewardDto,
        storeId,
      });

      const rewards = store.rewards || [];

      rewards.push(reward.id.toString());

      store.rewards = rewards;

      await this.storeModel.update({ rewards }, { where: { id: storeId } });

      return reward;
    } catch (error) {
      throw new BadRequestException(
        `Error in creating reward: ${error.message}`,
      );
    }
  }

  async getAll(paginateDto: PaginateDto): Promise<PaginatedResult<Reward>> {
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
          if (key === 'pointsRequired') {
            if (typeof value === 'object' && value !== null) {
              const { min, max } = value as { min?: number; max?: number };
              if (min !== undefined && min < 0) {
                throw new BadRequestException(
                  "Provided 'min' or is a positive number.",
                );
              }
              if (max !== undefined && max < 0) {
                throw new BadRequestException(
                  "Provided 'max' or is a positive number.",
                );
              }
              if (min !== undefined && max !== undefined) {
                filterConditions[key as keyof Reward] = {
                  [Op.between]: [min, max],
                };
              } else if (min !== undefined) {
                filterConditions[key as keyof Reward] = {
                  [Op.gte]: min,
                };
              } else if (max !== undefined) {
                filterConditions[key as keyof Reward] = {
                  [Op.lte]: max,
                };
              }
            }
          } else if (typeof value === 'string') {
            filterConditions[key as keyof Reward] = { [Op.like]: `%${value}%` };
          } else {
            filterConditions[key as keyof Reward] = value;
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

      const totalItems = await this.rewardModel.count({
        where: filterConditions,
      });
      const totalPages = Math.ceil(totalItems / limit);

      const result = await this.rewardModel.findAll({
        attributes: [
          'id',
          'name',
          'pointsRequired',
          'description',
          'quantity',
          'expiredAt',
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
}
