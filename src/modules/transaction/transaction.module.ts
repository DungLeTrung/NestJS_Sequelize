import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  Rank,
  Store,
  StoreUser,
  Transaction,
  User,
  UserPointsHistory,
} from 'src/database';

import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Store,
      Transaction,
      User,
      StoreUser,
      UserPointsHistory,
      Rank
    ]),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
