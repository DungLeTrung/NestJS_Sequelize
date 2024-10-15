import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Store, StoreUser, Transaction, User } from 'src/database';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction)
    private readonly transactionModel: typeof Transaction,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Store) private readonly storeModel: typeof Store,
    @InjectModel(StoreUser) private readonly storeUserModel: typeof StoreUser,
    private readonly sequelize: Sequelize,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.sequelize.transaction();
    try {
      const { userId, storeId, totalPayment } = createTransactionDto;

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

      const newTransaction = await this.transactionModel.create(
        {
          userId,
          storeId,
          totalPayment,
        },
        { transaction },
      );

      const existStoreUser = await this.storeUserModel.findOne({
        where: { userId: userId, storeId: storeId },
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

      await transaction.commit();
      return newTransaction;
    } catch (error) {
      await transaction.rollback();
      throw new BadRequestException(
        `Failed to create transaction: ${error.message}`,
      );
    }
  }

  findAll() {
    return `This action returns all transaction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
