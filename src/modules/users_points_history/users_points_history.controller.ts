import { Controller } from '@nestjs/common';

import { UsersPointsHistoryService } from './users_points_history.service';

@Controller('users-points-history')
export class UsersPointsHistoryController {
  constructor(
    private readonly usersPointsHistoryService: UsersPointsHistoryService,
  ) {}
}
