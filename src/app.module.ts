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
  UserPointsHistory,
  UserRankHistory,
  UserReward,
} from './database';
import { IoRedisModule, UploadsModule, UsersModule } from './modules';
import { RankModule } from './modules/rank';
import { RewardsModule } from './modules/rewards/rewards.module';
import { StoresModule } from './modules/stores/stores.module';
import { StoresUsersModule } from './modules/stores_users/stores_users.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { UsersPointsHistoryModule } from './modules/users_points_history/users_points_history.module';
import { UsersRankHistoryModule } from './modules/users_rank_history/users_rank_history.module';
import { UsersRewardsModule } from './modules/users_rewards/users_rewards.module';
import { TransactionRewardsModule } from './modules/transaction_rewards/transaction_rewards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      useFactory: () => ({
        dialect: 'postgres',
        host: process.env.POSTGRES_HOST,
        port: +process.env.POSTGRES_PORT,
        username: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
        synchronize: true,
        autoLoadModels: true,
        models: [
          User,
          Rank,
          Store,
          Reward,
          StoreUser,
          UserReward,
          UserRankHistory,
          Transaction,
          UserPointsHistory,
          TransactionReward
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
    UsersRankHistoryModule,
    UsersPointsHistoryModule,
    TransactionModule,
    TransactionRewardsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
