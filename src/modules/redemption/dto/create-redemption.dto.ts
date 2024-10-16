import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateRedemptionDto {
  @IsInt()
  @IsNotEmpty()
  rewardId: number;

  @IsInt()
  @IsNotEmpty()
  storeId: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}
