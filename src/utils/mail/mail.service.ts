import { BadRequestException, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { from, password, username } from 'src/constants/enums/const';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: username,
        pass: password,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    try {
      const mailOptions = {
        from: from,
        to,
        subject,
        text,
      };
      await this.transporter.sendMail(mailOptions);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
