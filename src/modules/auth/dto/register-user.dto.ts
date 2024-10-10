import { IsEmail, IsNotEmpty, IsString, MinLength, IsPhoneNumber, MaxLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @MaxLength(20)
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @MaxLength(50)
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber('VN') 
  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MaxLength(20)
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @MaxLength(20)
  @IsNotEmpty()
  lastName: string;
}
