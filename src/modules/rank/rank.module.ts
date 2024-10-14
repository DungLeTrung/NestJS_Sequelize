import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Rank } from 'src/database';

import { RankController } from './rank.controller';
import { RankService } from './rank.service';

@Module({
  imports: [SequelizeModule.forFeature([Rank])],
  controllers: [RankController],
  providers: [RankService],
})
export class RankModule {}
