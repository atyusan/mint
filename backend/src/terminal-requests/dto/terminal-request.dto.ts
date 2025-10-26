import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';

export enum TerminalRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED',
}

export class CreateTerminalRequestDto {
  @IsString()
  @IsNotEmpty()
  outletId: string;

  @IsString()
  @IsNotEmpty()
  merchantId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  modelId: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateTerminalRequestDto {
  @IsEnum(TerminalRequestStatus)
  @IsOptional()
  status?: TerminalRequestStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

export class TerminalRequestSearchDto {
  @IsString()
  @IsOptional()
  outletId?: string;

  @IsString()
  @IsOptional()
  merchantId?: string;

  @IsEnum(TerminalRequestStatus)
  @IsOptional()
  status?: TerminalRequestStatus;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}
