import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { AppController } from './app.controller';
import {
  PostgresqlModule,
  Rank,
  Redemption,
  Reward,
  Store,
  StoreUser,
  Transaction,
  User,
} from './database';
import { IoRedisModule, UploadsModule, UsersModule } from './modules';
import { AuthModule } from './modules/auth/auth.module';
import { RankModule } from './modules/rank';
import { RewardsModule } from './modules/rewards/rewards.module';
import { StoresModule } from './modules/stores/stores.module';
import { StoresUsersModule } from './modules/stores_users/stores_users.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { TwilioModule } from './utils/twilio/twilio.module';
import { RedemptionModule } from './modules/redemption/redemption.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'mail',
    }),
    SequelizeModule.forRootAsync({
      useFactory: () => ({
        dialect: 'postgres',
        host: process.env.POSTGRES_HOST,
        port: +process.env.POSTGRES_PORT,
        username: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
        synchronize: false,
        autoLoadModels: true,
        models: [User, Rank, Store, Reward, StoreUser, Transaction, Redemption],
      }),
    }),
    IoRedisModule,
    UploadsModule,
    UsersModule,
    PostgresqlModule,
    RankModule,
    StoresModule,
    RewardsModule,
    StoresUsersModule,
    TransactionModule,
    AuthModule,
    TwilioModule,
    RedemptionModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
