import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { PointType } from 'src/constants/enums/point.enum';
import { Rank, Store, StoreUser, Transaction, User } from 'src/database';
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

      if (!rank) {
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

      if (pointType === PointType.CLASSIC) {
        const ranksPoints = await this.rankModel.findAll({
          order: [['requiredPoints', 'ASC']],
        });
        let pointsRate = 0;

        for (const rank of ranksPoints) {
          if (user.rankId === rank.id) {
            pointsRate = rank.fixedPoints;
            break;
          }
        }

        const pointsEarned =
          Math.floor(totalPayment / rank?.amount) * pointsRate;

        if (user) {
          user.pointsEarned += pointsEarned;
          await this.userModel.update(
            { pointsEarned: user.pointsEarned },
            { where: { id: user.id }, transaction },
          );
        } else {
          await this.userModel.create(
            {
              userId: userId,
              transactionId: newTransaction.id,
              pointsEarned: pointsEarned,
            },
            { transaction },
          );
        }
      }

      const ranks = await this.rankModel.findAll({
        order: [['requiredPoints', 'ASC']],
      });

      for (const rank of ranks) {
        if (user.pointsEarned >= rank.requiredPoints) {
          await this.userModel.update(
            { rankId: rank.id },
            { where: { id: userId }, transaction },
            
          );
        }
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
