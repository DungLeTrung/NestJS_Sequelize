import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User, UserPointsHistory } from 'src/database';

@Injectable()
export class UsersPointsHistoryService {
  constructor(
    @InjectModel(UserPointsHistory)
    private readonly userPointModel: typeof UserPointsHistory,
  ) {}

  async listPointHistories(userId: number): Promise<UserPointsHistory[]> {
    try {
      const result = await this.userPointModel.findAll({
        where: { userId: userId },
        attributes: ['id', 'points_earned', 'createdAt'],
        include: [
          {
            model: User,
            attributes: ['phoneNumber', 'username', 'email'],
          },
        ],
        raw: true,
        nest: true,
      });

      return result;
    } catch (error) {
      throw new BadRequestException(`Error in findAll: ${error.message}`);
    }
  }
}
