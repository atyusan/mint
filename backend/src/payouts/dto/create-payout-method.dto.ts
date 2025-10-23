import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreatePayoutMethodDto {
  @IsString()
  @IsNotEmpty()
  methodType: string;

  @IsString()
  @IsNotEmpty()
  accountName: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsOptional()
  @IsString()
  bankCode?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  metadata?: any;
}
