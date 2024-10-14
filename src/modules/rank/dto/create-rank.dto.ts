import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRankDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  requiredPoints: number;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  fixedPoints?: number;

  @IsOptional()
  @IsNumber()
  percentagePoints?: number;

  @IsOptional()
  @IsNumber()
  maxPercentagePoints?: number;
}
