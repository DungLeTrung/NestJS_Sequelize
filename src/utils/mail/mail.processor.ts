import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { MailService } from './mail.service';

@Processor('mail')
export class MailProcessor {
  constructor(private readonly emailService: MailService) {}

  @Process()
  async handleEmail(job: Job) {
    const { to, subject, text } = job.data;
    await this.emailService.sendEmail(to, subject, text);
    console.log('Email has been sent');
  }
}
