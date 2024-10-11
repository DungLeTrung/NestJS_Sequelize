import { Controller } from '@nestjs/common';

import { TransactionRewardsService } from './transaction_rewards.service';

@Controller('transaction-rewards')
export class TransactionRewardsController {
  constructor(
    private readonly transactionRewardsService: TransactionRewardsService,
  ) {}
}
