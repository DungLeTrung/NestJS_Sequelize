import {IsNumber, IsInt, IsNotEmpty, IsEnum } from 'class-validator';
import { PointType } from 'src/constants/enums/point.enum';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsNotEmpty()
  @IsInt()
  storeId: number;

  @IsNotEmpty()
  @IsNumber()
  totalPayment: number;

  @IsNotEmpty()
  @IsEnum(PointType) 
  pointType: PointType;
}
