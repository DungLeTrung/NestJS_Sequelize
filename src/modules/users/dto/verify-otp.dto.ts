import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, Matches, MaxLength } from 'class-validator';

export class VerifyOtpDto {
  @IsPhoneNumber('VN') 
  @IsNotEmpty()
  phoneNumber: string;


  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'OTP code must be exactly 4 digits' })
  otpCode: string;
}
