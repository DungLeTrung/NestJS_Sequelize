import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Store, User } from 'src/database';
import { MailProcessor } from 'src/utils/mail/mail.processor';
import { MailService } from 'src/utils/mail/mail.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Store]),
    BullModule.registerQueue({
      name: 'mail',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, MailProcessor],
  exports: [AuthService, SequelizeModule],
})
export class AuthModule {}
