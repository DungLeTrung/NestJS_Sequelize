import { PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { CreateRankDto } from './create-rank.dto';

export class UpdateRankDto extends PartialType(CreateRankDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  requiredPoints?: number;

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
  @Max(100)
  percentagePoints?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxPercentagePoints?: number;
}
