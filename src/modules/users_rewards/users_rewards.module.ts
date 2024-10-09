import { Module } from '@nestjs/common';
import { UsersRewardsService } from './users_rewards.service';
import { UsersRewardsController } from './users_rewards.controller';

@Module({
  controllers: [UsersRewardsController],
  providers: [UsersRewardsService]
})
export class UsersRewardsModule {}
