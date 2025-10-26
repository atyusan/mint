import { PartialType } from '@nestjs/mapped-types';
import { CreateTerminalModelDto } from './create-terminal-model.dto';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTerminalModelDto extends PartialType(
  CreateTerminalModelDto
) {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
