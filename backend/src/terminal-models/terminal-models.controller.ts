import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TerminalModelsService } from './terminal-models.service';
import { CreateTerminalModelDto } from './dto/create-terminal-model.dto';
import { UpdateTerminalModelDto } from './dto/update-terminal-model.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('terminal-models')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TerminalModelsController {
  constructor(private readonly terminalModelsService: TerminalModelsService) {}

  @Post()
  @RequirePermissions({ resource: 'terminal', action: 'create' })
  create(@Body() createTerminalModelDto: CreateTerminalModelDto) {
    return this.terminalModelsService.create(createTerminalModelDto);
  }

  @Get()
  @RequirePermissions({ resource: 'terminal', action: 'read' })
  findAll() {
    return this.terminalModelsService.findAll();
  }

  @Get(':id')
  @RequirePermissions({ resource: 'terminal', action: 'read' })
  findOne(@Param('id') id: string) {
    return this.terminalModelsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'terminal', action: 'update' })
  update(
    @Param('id') id: string,
    @Body() updateTerminalModelDto: UpdateTerminalModelDto
  ) {
    return this.terminalModelsService.update(id, updateTerminalModelDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'terminal', action: 'delete' })
  remove(@Param('id') id: string) {
    return this.terminalModelsService.remove(id);
  }
}
