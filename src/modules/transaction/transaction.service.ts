import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  FixedPoints,
  FixedRanks,
  PointType,
  RankId,
} from 'src/constants/enums/point.enum';
import { RankClassic } from 'src/constants/enums/rank.enum';
import {
  Rank,
  Store,
  StoreUser,
  Transaction,
  User,
  UserPointsHistory,
} from 'src/database';
import { PaginatedResult, PaginateDto } from 'src/utils/decorators/paginate';

import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction)
    private readonly transactionModel: typeof Transaction,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Store) private readonly storeModel: typeof Store,
    @InjectModel(StoreUser) private readonly storeUserModel: typeof StoreUser,
    @InjectModel(Rank) private readonly rankModel: typeof Rank,
    @InjectModel(UserPointsHistory)
    private readonly userPointModel: typeof UserPointsHistory,
    private readonly sequelize: Sequelize,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.sequelize.transaction();
    try {
      const { userId, storeId, totalPayment, pointType } = createTransactionDto;

      const user = await this.userModel.findOne({
        where: { id: userId, isActive: true },
        transaction,
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const store = await this.storeModel.findOne({
        where: { id: storeId, isActive: true, isApproved: true },
        transaction,
      });
      if (!store) {
        throw new BadRequestException('Store not found');
      }

      if (
        pointType !== PointType.CLASSIC &&
        pointType !== PointType.PERCENTAGE
      ) {
        throw new BadRequestException(
          'Types must be a CLASSIC or a PERCENTAGE',
        );
      }

      const rank = await this.rankModel.findOne({
        where: { id: user.rankId },
        transaction,
      });

      if(!rank) {
        throw new BadRequestException('Users have not ranking');
      }

      const newTransaction = await this.transactionModel.create(
        {
          userId,
          storeId,
          totalPayment,
          pointType,
        },
        { transaction },
      );

      const existStoreUser = await this.storeUserModel.findOne({
        where: { userId: userId, storeId: storeId },
        transaction,
      });

      if (!existStoreUser) {
        await this.storeUserModel.create(
          {
            userId: userId,
            storeId: storeId,
          },
          { transaction },
        );
      }

      const existingPointsHistory = await this.userPointModel.findOne({
        where: {
          userId: userId,
        },
        transaction,
      });

      if (pointType === PointType.CLASSIC) {
        let pointsRate: number;
        if (rank?.name === RankClassic.BRONZE) {
          pointsRate = FixedPoints.Bronze;
        } else if (rank?.name === RankClassic.SLIVER) {
          pointsRate = FixedPoints.Sliver;
        } else if (rank?.name === RankClassic.GOLD) {
          pointsRate = FixedPoints.Gold;
        } else {
          pointsRate = rank?.fixedPoints;
        }

        const pointsEarned = Math.floor(totalPayment / rank?.amount) * pointsRate;

        if (existingPointsHistory) {
          existingPointsHistory.pointsEarned += pointsEarned;
          await this.userPointModel.update(
            { pointsEarned: existingPointsHistory.pointsEarned },
            { where: { id: existingPointsHistory.id }, transaction },
          );
        } else {
          await this.userPointModel.create(
            {
              userId: userId,
              transactionId: newTransaction.id,
              pointsEarned: pointsEarned,
            },
            { transaction },
          );
        }
      }

      if (existingPointsHistory.pointsEarned >= FixedRanks.Sliver) {
        await this.userModel.update(
          { rankId: RankId.Sliver },
          { where: { id: userId } },
        );
      } else if (existingPointsHistory.pointsEarned >= FixedRanks.Gold) {
        await this.userModel.update(
          { rankId: RankId.Gold },
          { where: { id: userId } },
        );
      }

      await transaction.commit();
      return newTransaction;
    } catch (error) {
      await transaction.rollback();
      throw new BadRequestException(
        `Failed to create transaction: ${error.message}`,
      );
    }
  }

  async listTransactionsforStore(
    storeId: number,
    paginateDto: PaginateDto,
  ): Promise<PaginatedResult<Transaction>> {
    try {
      const {
        page = 1,
        limit,
        sortBy = 'id',
        sortOrder = 'ASC',
        filters = {},
      } = paginateDto;

      const filterConditions: WhereOptions = {
        storeId: storeId,
      };

      if (filters && typeof filters === 'object') {
        for (const [key, value] of Object.entries(filters)) {
          if (key === 'createdAt') {
            if (typeof value === 'object' && value !== null) {
              const { min, max } = value as { min?: string; max?: string };
              if (min && isNaN(new Date(min).getTime())) {
                throw new BadRequestException("Provided 'min' is a valid day.");
              }
              if (max && isNaN(new Date(max).getTime())) {
                throw new BadRequestException("Provided 'max' is a valid day.");
              }
              if (min && max) {
                filterConditions[key as keyof Transaction] = {
                  [Op.between]: [new Date(min), new Date(max)],
                };
              } else if (min) {
                filterConditions[key as keyof Transaction] = {
                  ...filterConditions[key as keyof Transaction],
                  [Op.gte]: new Date(min),
                };
              } else if (max) {
                filterConditions[key as keyof Transaction] = {
                  ...filterConditions[key as keyof Transaction],
                  [Op.lte]: new Date(min),
                };
              }
            }
          } else if (typeof value === 'string') {
            filterConditions[key as keyof Transaction] = {
              [Op.like]: `%${value}%`,
            };
          } else {
            filterConditions[key as keyof Transaction] = value;
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

      const totalItems = await this.transactionModel.count({
        where: filterConditions,
      });
      const totalPages = Math.ceil(totalItems / limit);

      const result = await this.transactionModel.findAll({
        attributes: ['id', 'total_payment', 'createdAt'],
        where: filterConditions,
        offset: isPaginationEnabled ? offset : undefined,
        limit: isPaginationEnabled ? limit : undefined,
        order: [[sortBy, sortOrder]],
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'email', 'firstName', 'lastName'],
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

  async listTransactionsforUsers(
    userId: number,
    paginateDto: PaginateDto,
  ): Promise<PaginatedResult<Transaction>> {
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
          if (key === 'createdAt') {
            if (typeof value === 'object' && value !== null) {
              const { min, max } = value as { min?: string; max?: string };
              if (min && isNaN(new Date(min).getTime())) {
                throw new BadRequestException("Provided 'min' is a valid day.");
              }
              if (max && isNaN(new Date(max).getTime())) {
                throw new BadRequestException("Provided 'max' is a valid day.");
              }
              if (min && max) {
                filterConditions[key as keyof Transaction] = {
                  [Op.between]: [new Date(min), new Date(max)],
                };
              } else if (min) {
                filterConditions[key as keyof Transaction] = {
                  ...filterConditions[key as keyof Transaction],
                  [Op.gte]: new Date(min),
                };
              } else if (max) {
                filterConditions[key as keyof Transaction] = {
                  ...filterConditions[key as keyof Transaction],
                  [Op.lte]: new Date(min),
                };
              }
            }
          } else if (typeof value === 'string') {
            filterConditions[key as keyof Transaction] = {
              [Op.like]: `%${value}%`,
            };
          } else {
            filterConditions[key as keyof Transaction] = value;
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

      const totalItems = await this.transactionModel.count({
        where: filterConditions,
      });
      const totalPages = Math.ceil(totalItems / limit);

      const result = await this.transactionModel.findAll({
        attributes: ['id', 'total_payment', 'createdAt'],
        where: filterConditions,
        offset: isPaginationEnabled ? offset : undefined,
        limit: isPaginationEnabled ? limit : undefined,
        order: [[sortBy, sortOrder]],
        include: [
          {
            model: Store,
            attributes: ['id', 'name', 'email'],
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

  async delete(id: string): Promise<string> {
    try {
      const transaction = await this.transactionModel.findOne({
        where: { id },
      });
      if (!transaction) {
        throw new NotFoundException(`Transaction with id ${id} not found`);
      }

      await this.transactionModel.destroy({ where: { id } });

      return `Transaction with id ${id} has been deleted successfully`;
    } catch (error) {
      throw new BadRequestException(
        `Failed to delete transaction: ${error.message}`,
      );
    }
  }
}
