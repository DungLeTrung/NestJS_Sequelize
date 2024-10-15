import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserPointsHistory } from 'src/database';

import { UsersPointsHistoryController } from './users_points_history.controller';
import { UsersPointsHistoryService } from './users_points_history.service';

@Module({
  imports: [SequelizeModule.forFeature([UserPointsHistory])],
  controllers: [UsersPointsHistoryController],
  providers: [UsersPointsHistoryService],
})
export class UsersPointsHistoryModule {}
