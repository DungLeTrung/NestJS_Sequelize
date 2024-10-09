import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { redis } from 'src/configs';

import { RedisService } from './redis.service';

@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory: () => {
        return {
          config: {
            host: redis.host,
            port: redis.port,
            password: redis.password,
            db: redis.db,
            keyPrefix: redis.keyPrefix,
          },
        };
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class IoRedisModule {}
