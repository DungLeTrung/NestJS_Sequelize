import { Controller } from '@nestjs/common';
import { UsersRankHistoryService } from './users_rank_history.service';

@Controller('users-rank-history')
export class UsersRankHistoryController {
  constructor(private readonly usersRankHistoryService: UsersRankHistoryService) {}
}
