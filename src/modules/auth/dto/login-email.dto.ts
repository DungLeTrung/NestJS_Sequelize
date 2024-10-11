import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginWithEmailDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MaxLength(50)
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
