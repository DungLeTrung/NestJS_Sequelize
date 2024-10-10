import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/database';

import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.services';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    BullModule.registerQueue({
      name: 'mail',
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
