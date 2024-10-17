import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { Redemption, Reward, Store, StoreUser, User } from 'src/database';
import { PaginatedResult, PaginateDto } from 'src/utils/decorators/paginate';

import { CreateRedemptionDto } from './dto/create-redemption.dto';

@Injectable()
export class RedemptionService {
  constructor(
    @InjectModel(Redemption)
    private redemptionModel: typeof Redemption,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Reward)
    private rewardModel: typeof Reward,
    @InjectModel(Store)
    private storeModel: typeof Store,
    @InjectModel(StoreUser)
    private storeUserModel: typeof StoreUser,
  ) {}

  async create(
    userId: number,
    createRedemptionDto: CreateRedemptionDto,
  ): Promise<Redemption> {
    try {
      const { rewardId, storeId, quantity } = createRedemptionDto;

      const storeExist = await this.storeModel.findOne({
        where: { id: storeId },
      });

      if (!storeExist) {
        throw new Error('Store not found.');
      }

      const reward = await this.rewardModel.findOne({
        where: { id: rewardId, quantity: { [Op.gt]: 0 } },
      });
      if (!reward) {
        throw new Error('Reward not found.');
      }

      const user = await this.userModel.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new Error('User is not exist.');
      }

      const storeUser = await this.storeUserModel.findOne({
        where: { userId, storeId },
      });
      if (!storeUser) {
        throw new Error('User is not part of these store.');
      }

      const store = await this.storeModel.findOne({
        where: { id: storeId },
        include: [{ model: Reward, where: { id: rewardId } }],
        raw: true,
        nest: true,
      });

      if (!store) {
        throw new Error('These rewards is not exist in the store.');
      }

      if (!store.rewards) {
        throw new Error('This store does not have the specified reward.');
      }

      let redemption;
      const pointRewards = reward.pointsRequired * quantity;

      if(reward.quantity >= quantity && user.pointsEarned - pointRewards >= 0) {

        redemption = await this.redemptionModel.create({
          userId,
          rewardId,
          storeId,
          quantity,
          pointRewards,
        });
  
        await this.rewardModel.update(
          { quantity: Math.max(reward.quantity - redemption.quantity, 0) },
          { where: { id: rewardId } },
        );
  
        await this.userModel.update(
          { pointsEarned: user.pointsEarned - redemption.pointRewards },
          { where: { id: userId } },
        );
      } else {
        throw new BadRequestException(
          `Check quantity of rewards which have only ${reward.quantity} items OR you have only ${user.pointsEarned} within the rewards need up to ${pointRewards}`,
        );
      }

      return redemption;
    } catch (error) {
      throw new BadRequestException(
        `Failed to change rewards: ${error.message}`,
      );
    }
  }

  async getAll(
    userId: number,
    paginateDto: PaginateDto,
  ): Promise<PaginatedResult<Redemption>> {
    try {
      const {
        page = 1,
        limit,
        sortBy = 'id',
        sortOrder = 'ASC',
        filters = {},
      } = paginateDto;

      const filterConditions: WhereOptions = {
        userId: userId,
      };

      if (filters && typeof filters === 'object') {
        for (const [key, value] of Object.entries(filters)) {
          if (typeof value === 'string') {
            filterConditions[key as keyof Redemption] = {
              [Op.like]: `%${value}%`,
            };
          } else {
            filterConditions[key as keyof Redemption] = value;
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

      const totalItems = await this.redemptionModel.count({
        where: filterConditions,
      });
      const totalPages = Math.ceil(totalItems / limit);

      const result = await this.redemptionModel.findAll({
        where: filterConditions,
        offset: isPaginationEnabled ? offset : undefined,
        limit: isPaginationEnabled ? limit : undefined,
        order: [[sortBy, sortOrder]],
        include: [
          {
            model: Store,
            attributes: ['name', 'email'],
          },
          {
            model: User,
            attributes: ['username', 'email'],
          },
          {
            model: Reward,
            attributes: ['name', 'description'],
          },
        ],
        raw: true,
        nest: true,
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
