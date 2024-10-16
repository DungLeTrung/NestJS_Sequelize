import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Redemption, Reward, Store, StoreUser, User } from 'src/database';

import { RedemptionController } from './redemption.controller';
import { RedemptionService } from './redemption.service';

@Module({
  imports: [SequelizeModule.forFeature([Redemption, User, Reward, StoreUser, Store])],
  controllers: [RedemptionController],
  providers: [RedemptionService],
})
export class RedemptionModule {}
