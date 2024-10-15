import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomStoreRequest } from 'src/constants/custom.request';
import { Reward } from 'src/database';
import { ResponseMessage } from 'src/utils/decorators/customize';
import { PaginatedResult, PaginateDto } from 'src/utils/decorators/paginate';

import { JwtStoreAuthGuard } from '../auth/jwt-store.guard';

import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RewardsService } from './rewards.service';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @UseGuards(JwtStoreAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('imageUrl'))
  @ResponseMessage('CREATE REWARD')
  @HttpCode(201)
  createReward(
    @UploadedFile() file: Express.Multer.File,
    @Body() createRewardDto: CreateRewardDto,
    @Req() req: CustomStoreRequest,
  ) {
    createRewardDto.imageUrl = file?.path;
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

  @Get(':id')
  @HttpCode(201)
  @ResponseMessage('GET REWARD BY ID')
  async getRankById(@Param('id') id: string): Promise<Reward> {
    return await this.rewardsService.findById(id);
  }

  @UseGuards(JwtStoreAuthGuard)
  @Delete(':id')
  @HttpCode(201)
  @ResponseMessage('DELETE REWARD')
  async deleteReward(
    @Param('id') id: number,
    @Req() req: CustomStoreRequest,
  ): Promise<string> {
    const { id: storeId } = req.store;
    return await this.rewardsService.deleteReward(id, storeId);
  }

  @UseGuards(JwtStoreAuthGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('imageUrl'))
  @HttpCode(201)
  @ResponseMessage('UPDATE REWARD')
  async updateRank(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @Body() updateRewardDto: UpdateRewardDto,
    @Req() req: CustomStoreRequest,
  ) {
    updateRewardDto.imageUrl = file?.path;
    const { id: storeId } = req.store;
    return await this.rewardsService.update(id, updateRewardDto, storeId);
  }
}
