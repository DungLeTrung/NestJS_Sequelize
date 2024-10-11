import { IsBoolean, IsOptional, IsPhoneNumber, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @MaxLength(50)
  @IsString()
  username?: string;

  @IsOptional()
  @MaxLength(30)
  @IsString()
  firstName?: string;

  @IsOptional()
  @MaxLength(30)
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber('VN')
  phoneNumber?: string;


  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
