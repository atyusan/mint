import { IsString, IsNotEmpty } from 'class-validator';

export class AssignTerminalDto {
  @IsString()
  @IsNotEmpty()
  outletId: string;
}
