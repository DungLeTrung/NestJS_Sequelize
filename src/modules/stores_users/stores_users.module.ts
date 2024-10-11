import { Module } from '@nestjs/common';

import { StoresUsersController } from './stores_users.controller';
import { StoresUsersService } from './stores_users.service';

@Module({
  controllers: [StoresUsersController],
  providers: [StoresUsersService],
})
export class StoresUsersModule {}
