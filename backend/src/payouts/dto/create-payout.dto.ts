import { IsString, IsNotEmpty, IsNumber, IsEnum, Min } from 'class-validator';
import { PayoutFrequency } from '@prisma/client';

export class CreatePayoutDto {
  @IsString()
  @IsNotEmpty()
  payoutMethodId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNumber()
  @Min(0)
  fee: number;

  @IsNumber()
  @Min(0.01)
  netAmount: number;

  @IsEnum(PayoutFrequency)
  frequency: PayoutFrequency;

  @IsString()
  @IsNotEmpty()
  currency: string;
}
