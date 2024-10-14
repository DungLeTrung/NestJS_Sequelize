import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from 'src/constants';
import { Rank } from 'src/database';
import { ResponseMessage, Roles } from 'src/utils/decorators/customize';
import { PaginatedResult, PaginateDto } from 'src/utils/decorators/paginate';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { CreateRankDto } from './dto/create-rank.dto';
import { UpdateRankDto } from './dto/update-rank.dto';
import { RankService } from './rank.service';

@Controller('rank')
export class RankController {
  constructor(private readonly rankService: RankService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @ResponseMessage('CREATE RANK')
  @HttpCode(200)
  create(@Body() createRankDto: CreateRankDto) {
    return this.rankService.create(createRankDto);
  }

  @Get()
  @HttpCode(201)
  @ResponseMessage('LIST STORES')
  async getAll(
    @Query() paginateDto: PaginateDto,
  ): Promise<PaginatedResult<Rank>> {
    return await this.rankService.getAll(paginateDto);
  }

  @Get(':id')
  @HttpCode(201)
  @ResponseMessage('GET RANK BY ID')
  async getRankById(@Param('id') id: string): Promise<Rank> {
    return await this.rankService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRankDto: UpdateRankDto) {
    return this.rankService.update(+id, updateRankDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rankService.remove(+id);
  }
}
