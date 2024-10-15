import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { StoreUser } from 'src/database';

import { StoresUsersController } from './stores_users.controller';
import { StoresUsersService } from './stores_users.service';

@Module({
  imports: [SequelizeModule.forFeature([StoreUser])],
  controllers: [StoresUsersController],
  providers: [StoresUsersService],
})
export class StoresUsersModule {}
