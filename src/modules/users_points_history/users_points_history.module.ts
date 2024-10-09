import { Module } from '@nestjs/common';

import { UsersPointsHistoryController } from './users_points_history.controller';
import { UsersPointsHistoryService } from './users_points_history.service';

@Module({
  controllers: [UsersPointsHistoryController],
  providers: [UsersPointsHistoryService],
})
export class UsersPointsHistoryModule {}
