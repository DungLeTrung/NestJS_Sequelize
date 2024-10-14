import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Reward, Store } from 'src/database';

import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';

@Module({
  imports: [SequelizeModule.forFeature([Reward, Store])],
  controllers: [RewardsController],
  providers: [RewardsService],
})
export class RewardsModule {}
