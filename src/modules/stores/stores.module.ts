import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Store } from 'src/database';

import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Store]),
    BullModule.registerQueue({
      name: 'mail',
    }),
  ],
  controllers: [StoresController],
  providers: [StoresService],
})
export class StoresModule {}
