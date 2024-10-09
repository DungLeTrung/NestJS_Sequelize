import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { application, mysql, sslConfig } from 'src/configs';

import * as models from './entities';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        dialect: 'mysql',
        autoLoadModels: false,
        models: Object.values(models),
        logging: false,
        query: {
          raw: true,
        },
        dialectOptions: application.environment != 'local' ? sslConfig : {},
        ...mysql,
      }),
    }),
  ],
})
export class MysqlModule {}
