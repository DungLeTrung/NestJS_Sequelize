import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { RankClassic } from 'src/constants/enums/rank.enum';
import { Rank, User } from 'src/database';
import { PaginatedResult, PaginateDto } from 'src/utils/decorators/paginate';

import { CreateRankDto } from './dto/create-rank.dto';
import { UpdateRankDto } from './dto/update-rank.dto';

@Injectable()
export class RankService {
  constructor(
    @InjectModel(Rank)
    private readonly rankModel: typeof Rank,
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly sequelize: Sequelize,
  ) {}

  async create(createRankDto: CreateRankDto): Promise<Rank> {
    const {name, requiredPoints, amount, fixedPoints, percentagePoints, maxPercentagePoints} = createRankDto;
    try {
      const rank = await this.rankModel.create({
        name,
        requiredPoints,
        amount,
        fixedPoints,
        percentagePoints,
        maxPercentagePoints,
      });

      const users = await this.userModel.findAll({
        where: { isActive: true },
      });

      for (const user of users) {
        const userPoints = user.pointsEarned;

        const closetRank = await this.rankModel.findOne({
          where: { requiredPoints: { [Op.lte]: userPoints } },
          order: [['requiredPoints', 'DESC']],
        });
        if (closetRank && closetRank.id !== user.rankId) {
          await this.userModel.update(
            { rankId: closetRank.id },
            { where: { id: user.id } },
          );
        }
      }

      return rank;
    } catch (error) {
      throw new BadRequestException(`Failed to create rank: ${error.message}`);
    }
  }

  async getAll(paginateDto: PaginateDto): Promise<PaginatedResult<Rank>> {
    try {
      const {
        page = 1,
        limit,
        sortBy = 'id',
        sortOrder = 'ASC',
        filters = {},
      } = paginateDto;

      const filterConditions: WhereOptions = {};

      if (filters && typeof filters === 'object') {
        for (const [key, value] of Object.entries(filters)) {
          if (key === 'requiredPoints') {
            if (typeof value === 'object' && value !== null) {
              const { min, max } = value as { min?: number; max?: number };
              if (min !== undefined && min < 0) {
                throw new BadRequestException(
                  "Provided 'min' or is a positive number.",
                );
              }
              if (max !== undefined && max < 0) {
                throw new BadRequestException(
                  "Provided 'max' or is a positive number.",
                );
              }
              if (min !== undefined && max !== undefined) {
                filterConditions[key as keyof Rank] = {
                  [Op.between]: [min, max],
                };
              } else if (min !== undefined) {
                filterConditions[key as keyof Rank] = { [Op.gte]: min };
              } else if (max !== undefined) {
                filterConditions[key as keyof Rank] = { [Op.lte]: max };
              }
            }
          } else if (typeof value === 'string') {
            filterConditions[key as keyof Rank] = { [Op.like]: `%${value}%` };
          } else {
            filterConditions[key as keyof Rank] = value;
          }
        }
      }

      const isPaginationEnabled = !!page && !!limit;
      let offset = 0;

      if (isPaginationEnabled) {
        offset = (page - 1) * limit;

        if (isNaN(offset) || isNaN(limit)) {
          throw new BadRequestException(
            "Provided 'skip' or 'limit' value is not a number.",
          );
        }
      }

      const totalItems = await this.rankModel.count({
        where: filterConditions,
      });
      const totalPages = Math.ceil(totalItems / limit);

      const result = await this.rankModel.findAll({
        attributes: [
          'id',
          'name',
          'requiredPoints',
          'amount',
          'fixedPoints',
          'percentagePoints',
          'maxPercentagePoints',
          'createdAt',
          'updatedAt',
        ],
        where: filterConditions,
        offset: isPaginationEnabled ? offset : undefined,
        limit: isPaginationEnabled ? limit : undefined,
        order: [[sortBy, sortOrder]],
      });

      return {
        result,
        records: {
          page,
          limit,
          totalPages,
          totalItems,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Error in findAll: ${error.message}`);
    }
  }

  async findById(id: number): Promise<Rank> {
    try {
      const rank = await this.rankModel.findOne({ where: { id } });
      if (!rank) {
        throw new NotFoundException('Rank not found');
      }

      return rank;
    } catch (error) {
      throw new BadRequestException(`Can not find rank: ${error.message}`);
    }
  }

  async update(id: number, updateRankDto: UpdateRankDto): Promise<Rank> {
    try {
      const rank = await this.rankModel.findOne({ where: { id } });
      if (!rank) {
        throw new NotFoundException(`Rank with id ${id} not found`);
      }

      if (updateRankDto.name) {
        const existingRank = await this.rankModel.findOne({
          where: { name: updateRankDto.name },
        });

        if (existingRank && existingRank.id !== id) {
          throw new BadRequestException(
            `Rank with name '${updateRankDto.name}' already exists`,
          );
        }
      }

      await this.rankModel.update(updateRankDto, { where: { id } });

      const users = await this.userModel.findAll({
        where: { isActive: true },
      });

      for (const user of users) {
        const userPoints = user.pointsEarned;

        const closetRank = await this.rankModel.findOne({
          where: { requiredPoints: { [Op.lte]: userPoints } },
          order: [['requiredPoints', 'DESC']],
        });
        if (closetRank && closetRank.id !== user.rankId) {
          await this.userModel.update(
            {
              rankId: closetRank.id,
            },
            { where: { id: user.id } },
          );
        }
      }

      const updatedRank = this.rankModel.findOne({ where: { id } });
      return updatedRank;
    } catch (error) {
      throw new BadRequestException(`Failed to update rank: ${error.message}`);
    }
  }

  async delete(id: number): Promise<string> {
    try {
      const rank = await this.rankModel.findOne({ where: { id } });
      if (!rank) {
        throw new NotFoundException(`Rank with id ${id} not found`);
      }

      const users = await this.userModel.findAll({
        where: { rankId: id, isActive: true },
      });

      for (const user of users) {
        const userPoints = user.pointsEarned;

        const closetRank = await this.rankModel.findOne({
          where: {
            requiredPoints: { [Op.lte]: userPoints },
            id: { [Op.ne]: id },
          },
          order: [['requiredPoints', 'DESC']],
        });
        if (closetRank && closetRank.id !== user.rankId) {
          await this.userModel.update(
            {
              rankId: closetRank.id,
            },
            { where: { id: user.id } },
          );
        }
      }

      await this.rankModel.destroy({ where: { id } });

      return `Rank with id ${id} has been deleted successfully`;
    } catch (error) {
      throw new BadRequestException(`Failed to delete rank: ${error.message}`);
    }
  }
}
