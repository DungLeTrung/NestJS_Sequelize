import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Store, StoreUser, Transaction, User } from 'src/database';

import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  imports: [SequelizeModule.forFeature([Store, Transaction, User, StoreUser])],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
