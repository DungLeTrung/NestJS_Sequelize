import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { StoreUser, User } from 'src/database';
import { PaginatedResult, PaginateDto } from 'src/utils/decorators/paginate';

@Injectable()
export class StoresUsersService {
  constructor(
    @InjectModel(StoreUser) private storeUserModel: typeof StoreUser,
  ) {}

  async listUsers(
    storeId: number,
    paginateDto: PaginateDto,
  ): Promise<PaginatedResult<StoreUser>> {
    try {
      const {
        page = 1,
        limit,
        sortBy = 'id',
        sortOrder = 'ASC',
        filters = {},
      } = paginateDto;

      const filterConditions: WhereOptions = {
        storeId: storeId,
      };

      if (filters && typeof filters === 'object') {
        for (const [key, value] of Object.entries(filters)) {
          if (typeof value === 'string') {
            filterConditions[key as keyof StoreUser] = {
              [Op.like]: `%${value}%`,
            };
          } else {
            filterConditions[key as keyof StoreUser] = value;
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

      const totalItems = await this.storeUserModel.count({
        where: filterConditions,
      });
      const totalPages = Math.ceil(totalItems / limit);

      const result = await this.storeUserModel.findAll({
        attributes: ['id', 'createdAt'],
        where: filterConditions,
        offset: isPaginationEnabled ? offset : undefined,
        limit: isPaginationEnabled ? limit : undefined,
        order: [[sortBy, sortOrder]],
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'email', 'firstName', 'lastName']
          },          
        ],
        raw: true,
        nest: true,
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
}
