import {IsNumber, IsInt, IsNotEmpty } from 'class-validator';

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
}
