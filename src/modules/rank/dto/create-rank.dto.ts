import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateRankDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  requiredPoints: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  fixedPoints?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  percentagePoints?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxPercentagePoints?: number;
}
