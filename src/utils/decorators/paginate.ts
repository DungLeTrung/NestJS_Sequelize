import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class PaginateDto {
  @IsOptional()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  filters?: Filters;
}

interface Filters {
  [key: string]: string | number | boolean; 
}
