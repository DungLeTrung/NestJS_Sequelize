import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CustomStoreRequest } from 'src/constants/custom.request';
import { Reward } from 'src/database';
import { ResponseMessage } from 'src/utils/decorators/customize';
import { PaginatedResult, PaginateDto } from 'src/utils/decorators/paginate';

import { JwtStoreAuthGuard } from '../auth/jwt-store.guard';

import { CreateRewardDto } from './dto/create-reward.dto';
import { RewardsService } from './rewards.service';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @UseGuards(JwtStoreAuthGuard)
  @Post()
  @ResponseMessage('CREATE REWARD')
  @HttpCode(201)
  createReward(
    @Body() createRewardDto: CreateRewardDto,
    @Req() req: CustomStoreRequest,
  ) {
    const { id: storeId } = req.store;
    return this.rewardsService.create(createRewardDto, storeId);
  }

  @Get()
  @HttpCode(201)
  @ResponseMessage('LIST REWARDS')
  async getAll(
    @Query() paginateDto: PaginateDto,
  ): Promise<PaginatedResult<Reward>> {
    return await this.rewardsService.getAll(paginateDto);
  }
}
