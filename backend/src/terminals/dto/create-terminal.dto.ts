import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { TerminalStatus } from '@prisma/client';

export class CreateTerminalDto {
  @IsString()
  @IsNotEmpty()
  outletId: string;

  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsOptional()
  @IsEnum(TerminalStatus)
  status?: TerminalStatus;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @IsOptional()
  metadata?: any;
}
