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
import { CustomRequest } from 'src/constants/custom.request';
import { ResponseMessage } from 'src/utils/decorators/customize';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { CreateRedemptionDto } from './dto/create-redemption.dto';
import { RedemptionService } from './redemption.service';
import { PaginatedResult, PaginateDto } from 'src/utils/decorators/paginate';
import { Redemption } from 'src/database';

@Controller('redemption')
export class RedemptionController {
  constructor(private readonly redemptionService: RedemptionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('CREATE REDEMPTION')
  @HttpCode(200)
  create(
    @Body() createRedemptionDto: CreateRedemptionDto,
    @Req() req: CustomRequest,
  ) {
    const { id: userId } = req.user;
    return this.redemptionService.create(userId, createRedemptionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @ResponseMessage('LIST STORES')
  async getAll(
    @Query() paginateDto: PaginateDto,
    @Req() req: CustomRequest,
  ): Promise<PaginatedResult<Redemption>> {
    const { id: userId } = req.user;
    return await this.redemptionService.getAll(userId, paginateDto);
  }
}
