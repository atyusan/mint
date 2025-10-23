import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TerminalsService } from './terminals.service';
import { CreateTerminalDto, UpdateTerminalDto, AssignTerminalDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { TerminalStatus } from '@prisma/client';

@Controller('terminals')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TerminalsController {
  constructor(private readonly terminalsService: TerminalsService) {}

  @Post()
  @RequirePermissions({ resource: 'terminal', action: 'create' })
  async create(@Body() createTerminalDto: CreateTerminalDto, @Request() req) {
    return this.terminalsService.createTerminal(createTerminalDto, req.user.id);
  }

  @Get()
  @RequirePermissions({ resource: 'terminal', action: 'read' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('outletId') outletId?: string,
    @Query('status') status?: TerminalStatus,
    @Query('merchantId') merchantId?: string,
  ) {
    return this.terminalsService.getTerminals(page, limit, outletId, status, merchantId);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'terminal', action: 'read' })
  async findOne(@Param('id') id: string) {
    return this.terminalsService.getTerminalById(id);
  }

  @Get(':id/stats')
  @RequirePermissions({ resource: 'terminal', action: 'read' })
  async getStats(@Param('id') id: string) {
    return this.terminalsService.getTerminalStats(id);
  }

  @Get(':id/activity')
  @RequirePermissions({ resource: 'terminal', action: 'read' })
  async getActivity(
    @Param('id') id: string,
    @Query('days') days?: number,
  ) {
    return this.terminalsService.getTerminalActivity(id, days);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'terminal', action: 'update' })
  async update(
    @Param('id') id: string,
    @Body() updateTerminalDto: UpdateTerminalDto,
    @Request() req,
  ) {
    return this.terminalsService.updateTerminal(id, updateTerminalDto, req.user.id);
  }

  @Patch(':id/status')
  @RequirePermissions({ resource: 'terminal', action: 'update' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: TerminalStatus,
    @Request() req,
  ) {
    return this.terminalsService.updateTerminalStatus(id, status, req.user.id);
  }

  @Patch(':id/assign')
  @RequirePermissions({ resource: 'terminal', action: 'update' })
  async assignTerminal(
    @Param('id') id: string,
    @Body() assignTerminalDto: AssignTerminalDto,
    @Request() req,
  ) {
    return this.terminalsService.assignTerminal(id, assignTerminalDto, req.user.id);
  }

  @Patch(':id/metadata')
  @RequirePermissions({ resource: 'terminal', action: 'update' })
  async updateMetadata(
    @Param('id') id: string,
    @Body('metadata') metadata: any,
    @Request() req,
  ) {
    return this.terminalsService.updateTerminalMetadata(id, metadata, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'terminal', action: 'delete' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.terminalsService.deleteTerminal(id, req.user.id);
  }
}
