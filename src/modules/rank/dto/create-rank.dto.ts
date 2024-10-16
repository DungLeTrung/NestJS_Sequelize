import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateRankDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  requiredPoints: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  amount?: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  fixedPoints?: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  percentagePoints?: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  maxPercentagePoints?: number;
}
