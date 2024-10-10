import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'OTP code must be exactly 4 digits' })
  otpCode: string;
}
