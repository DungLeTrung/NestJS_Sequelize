import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { Reward, Store } from 'src/database';
import { PaginatedResult, PaginateDto } from 'src/utils/decorators/paginate';

import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';

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
        attributes: { exclude: ['password'] },
      });

      if (!store) {
        throw new BadRequestException('A store has been disappeared.');
      }

      if (createRewardDto.expiredAt < new Date()) {
        throw new BadRequestException('expiredAt must be a future date.');
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

  async findById(id: string): Promise<Reward> {
    try {
      const reward = await this.rewardModel.findOne({
        where: { id },
        include: [
          {
            model: Store,
            attributes: ['name', 'email'],
          },
        ],
        raw: true,
        nest: true,
      });

      if (!reward) {
        throw new NotFoundException('Reward not found');
      }

      return reward;
    } catch (error) {
      throw new BadRequestException(`Can not find reward: ${error.message}`);
    }
  }

  async deleteReward(id: number, storeId: number): Promise<string> {
    try {
      const reward = await this.rewardModel.findOne({ where: { id } });

      if (!reward) {
        throw new NotFoundException('Reward not found');
      }

      if (reward.storeId !== storeId) {
        throw new BadRequestException(
          'You are not allowed to delete this reward',
        );
      }

      await this.rewardModel.destroy({ where: { id } });

      const store = await this.storeModel.findOne({
        where: { id: storeId },
        attributes: { exclude: ['password'] },
      });

      if (store) {
        if (store.rewards) {

          const updatedRewards = store.rewards.filter(
            (rewardId) => +rewardId != reward.id, 
          );

          await this.storeModel.update(
            { rewards: updatedRewards },
            { where: { id: storeId } },
          );
        }
      } else {
        throw new NotFoundException('Store not found');
      }

      return `Reward ${id} of store ${store.name} deleted successfully`;
    } catch (error) {
      throw new BadRequestException(
        `Error in deleting reward: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updateRewardDto: UpdateRewardDto,
    storeId: number,
  ): Promise<Reward> {
    try {
      const reward = await this.rewardModel.findOne({ where: { id } });

      if (!reward) {
        throw new NotFoundException(`Reward with id ${id} not found`);
      }

      if (updateRewardDto.name) {
        const existingReward = await this.rewardModel.findOne({
          where: { name: updateRewardDto.name },
        });
  
        if (existingReward && existingReward.id !== parseInt(id)) {
          throw new BadRequestException(
            `Reward with name '${updateRewardDto.name}' already exists`,
          );
        }
      }
  
      if (!(reward.storeId == storeId)) {
        throw new NotFoundException(`Store is not permission`);
      }

      await this.rewardModel.update(updateRewardDto, { where: { id } });

      const updatedReward = await this.rewardModel.findOne({
        where: { id },
      });

      return updatedReward;
    } catch (error) {
      throw new BadRequestException(`Failed to update reward: ${error.message}`);
    }
  }
}
