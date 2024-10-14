import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateRankDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  requiredPoints: number;

  @IsOptional()
  @IsPositive()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsPositive()
  @IsNumber()
  fixedPoints?: number;

  @IsOptional()
  @IsPositive()
  @IsNumber()
  percentagePoints?: number;

  @IsOptional()
  @IsPositive()
  @IsNumber()
  maxPercentagePoints?: number;
}
