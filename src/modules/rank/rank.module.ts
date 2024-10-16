import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Rank, User } from 'src/database';

import { RankController } from './rank.controller';
import { RankService } from './rank.service';

@Module({
  imports: [SequelizeModule.forFeature([Rank, User])],
  controllers: [RankController],
  providers: [RankService],
})
export class RankModule {}
