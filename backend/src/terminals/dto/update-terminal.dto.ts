import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { TerminalStatus } from '@prisma/client';

export class UpdateTerminalDto {
  @IsOptional()
  @IsString()
  modelId?: string;

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
  @IsNumber()
  batteryLevel?: number;

  @IsOptional()
  metadata?: any;
}
