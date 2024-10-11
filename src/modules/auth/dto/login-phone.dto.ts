import { IsNotEmpty, IsString } from 'class-validator';

export class LoginWithPhoneDto {
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
