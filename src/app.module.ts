import { Module } from '@nestjs/common';

import { PostgresqlModule } from './database';
import { UploadsModule, UsersModule, IoRedisModule } from './modules';
import { AppController } from './app.controller';

@Module({
  imports: [IoRedisModule, UploadsModule, UsersModule, PostgresqlModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
