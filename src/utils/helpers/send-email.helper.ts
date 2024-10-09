import { join } from 'path';

import NodeMailer from 'nodemailer';
import * as hbs from 'express-handlebars';
import { emailSender } from 'src/configs';

const mailHost = 'smtp.gmail.com';
const mailPort = 465;

export class SendEmailHelper {
  private static async sendMail(to, subject, content): Promise<string> {
    const transporter = NodeMailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: true,
      auth: {
        user: emailSender.email,
        pass: emailSender.password,
      },
    });

    const options = {
      from: {
        name: emailSender.name,
        address: emailSender.email,
      },
      to,
      subject,
      html: content,
    };

    const result = await transporter.sendMail(options);
    return result;
  }

  static async sendOTP({ to, subject, OTP }): Promise<string> {
    const hbsTemplate = hbs.create();
    const content = await hbsTemplate.render(
      join(__dirname, '../../src/views/send-otp.hbs'),
      {
        otp: OTP,
      },
    );
    return this.sendMail(to, subject, content);
  }
}
