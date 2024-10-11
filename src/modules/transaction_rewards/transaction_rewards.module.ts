import { Module } from '@nestjs/common';

import { TransactionRewardsController } from './transaction_rewards.controller';
import { TransactionRewardsService } from './transaction_rewards.service';

@Module({
  controllers: [TransactionRewardsController],
  providers: [TransactionRewardsService],
})
export class TransactionRewardsModule {}
