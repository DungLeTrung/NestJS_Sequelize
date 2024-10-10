import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class SendOtpDto {
  @MaxLength(50)
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
