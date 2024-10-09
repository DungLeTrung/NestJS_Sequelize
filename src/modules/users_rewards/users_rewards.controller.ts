import { Controller } from '@nestjs/common';
import { UsersRewardsService } from './users_rewards.service';

@Controller('users-rewards')
export class UsersRewardsController {
  constructor(private readonly usersRewardsService: UsersRewardsService) {}
}
