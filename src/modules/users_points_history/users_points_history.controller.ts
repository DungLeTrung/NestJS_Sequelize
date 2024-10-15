import { Controller, Get, HttpCode, Req, UseGuards } from '@nestjs/common';
import { CustomRequest } from 'src/constants/custom.request';
import { UserPointsHistory } from 'src/database';
import { ResponseMessage } from 'src/utils/decorators/customize';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { UsersPointsHistoryService } from './users_points_history.service';

@Controller('users-points-history')
export class UsersPointsHistoryController {
  constructor(
    private readonly usersPointsHistoryService: UsersPointsHistoryService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @HttpCode(201)
  @ResponseMessage('LIST POINT HISTORIES OF USER')
  async listPointHistories(
    @Req() req: CustomRequest,
  ): Promise<UserPointsHistory[]> {
    const { id: userId } = req.user;
    return await this.usersPointsHistoryService.listPointHistories(userId);
  }
}
