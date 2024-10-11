import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import ms from 'ms';
import { accessTime, accessTokenCode } from 'src/constants/enums/const';
import { Store, User } from 'src/database';
import { MailProcessor } from 'src/utils/mail/mail.processor';
import { MailService } from 'src/utils/mail/mail.service';

import { StoresModule, StoresService } from '../stores';
import { UsersModule, UsersService } from '../users';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './passport/jwt.strategy';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Store]), 
    UsersModule, StoresModule,
    BullModule.registerQueue({
      name: 'mail',
    }),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: accessTokenCode,
        signOptions: {
          expiresIn: ms(accessTime) / 1000,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    MailService,
    MailProcessor,
    JwtStrategy,
    UsersService,
    StoresService,
  ],
  exports: [AuthService, SequelizeModule],
})
export class AuthModule {}
