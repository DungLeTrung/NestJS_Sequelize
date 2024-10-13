import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateStoreDto {
  @IsOptional()
  @MaxLength(50)
  @IsString()
  name?: string;

  @IsOptional()
  @MaxLength(50)
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
