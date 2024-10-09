import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { application, postgresql, sslConfig } from 'src/configs';

import * as models from './entities';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        dialect: 'postgres',
        autoLoadModels: false,
        models: Object.values(models),
        logging: false,
        query: {
          raw: true,
        },
        dialectOptions: application.environment != 'local' ? sslConfig : {},
        ...postgresql,
      }),
    }),
  ],
})
export class PostgresqlModule {}
