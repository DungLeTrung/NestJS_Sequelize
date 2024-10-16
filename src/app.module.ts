import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { AppController } from './app.controller';
import {
  PostgresqlModule,
  Rank,
  Reward,
  Store,
  StoreUser,
  Transaction,
  TransactionReward,
  User,
  UserReward,
} from './database';
import { IoRedisModule, UploadsModule, UsersModule } from './modules';
import { AuthModule } from './modules/auth/auth.module';
import { RankModule } from './modules/rank';
import { RewardsModule } from './modules/rewards/rewards.module';
import { StoresModule } from './modules/stores/stores.module';
import { StoresUsersModule } from './modules/stores_users/stores_users.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { TransactionRewardsModule } from './modules/transaction_rewards/transaction_rewards.module';
import { UsersRewardsModule } from './modules/users_rewards/users_rewards.module';
import { TwilioModule } from './utils/twilio/twilio.module';

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
        models: [
          User,
          Rank,
          Store,
          Reward,
          StoreUser,
          UserReward,
          Transaction,
          TransactionReward,
        ],
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
    UsersRewardsModule,
    TransactionModule,
    TransactionRewardsModule,
    AuthModule,
    TwilioModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
