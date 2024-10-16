import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';

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
  @Max(100)
  percentagePoints?: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  maxPercentagePoints?: number;
}
