import { Module } from '@nestjs/common';
import { UsersRankHistoryService } from './users_rank_history.service';
import { UsersRankHistoryController } from './users_rank_history.controller';

@Module({
  controllers: [UsersRankHistoryController],
  providers: [UsersRankHistoryService]
})
export class UsersRankHistoryModule {}
