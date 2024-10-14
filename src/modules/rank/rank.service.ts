import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Rank } from 'src/database';

import { CreateRankDto } from './dto/create-rank.dto';
import { UpdateRankDto } from './dto/update-rank.dto';

@Injectable()
export class RankService {
  constructor(
    @InjectModel(Rank)
    private readonly rankModel: typeof Rank,
  ) {}

  async create(createRankDto: CreateRankDto): Promise<Rank> {
    try {
      const rank = await this.rankModel.create({
        name: createRankDto.name,
        requiredPoints: createRankDto.requiredPoints,
        amount: createRankDto.amount,
        fixedPoints: createRankDto.fixedPoints,
        percentagePoints: createRankDto.percentagePoints,
        maxPercentagePoints: createRankDto.maxPercentagePoints,
      });      
      return rank;
    } catch (error) {
      throw new BadRequestException(`Failed to create rank: ${error.message}`);
    }
  }

  findAll() {
    return `This action returns all rank`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rank`;
  }

  update(id: number, updateRankDto: UpdateRankDto) {
    return `This action updates a #${id} rank`;
  }

  remove(id: number) {
    return `This action removes a #${id} rank`;
  }
}
