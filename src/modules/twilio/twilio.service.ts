import { Injectable } from '@nestjs/common';
import Twilio from 'twilio'; 

@Injectable()
export class TwilioService {
  private client: Twilio.Twilio;

  constructor() {
    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN; 
    this.client = Twilio(accountSid, authToken); 
  }

  async sendSms(to: string, message: string): Promise<void> {
    try {
      await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER, 
        to: to, 
      });
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw new Error('Failed to send SMS');
    }
  }
}
