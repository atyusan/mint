import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { TerminalRequestsService } from './terminal-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import {
  CreateTerminalRequestDto,
  UpdateTerminalRequestDto,
  TerminalRequestStatus,
} from './dto/terminal-request.dto';

@Controller('terminal-requests')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TerminalRequestsController {
  constructor(
    private readonly terminalRequestsService: TerminalRequestsService
  ) {}

  @Post()
  @RequirePermissions({ resource: 'terminal', action: 'create' })
  async createTerminalRequest(
    @Body() createTerminalRequestDto: CreateTerminalRequestDto,
    @Request() req: any
  ) {
    const userId = req.user.id;
    return this.terminalRequestsService.createTerminalRequest(
      createTerminalRequestDto,
      userId
    );
  }

  @Get()
  @RequirePermissions({ resource: 'terminal', action: 'read' })
  async getTerminalRequests(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('outletId') outletId?: string,
    @Query('merchantId') merchantId?: string,
    @Query('status') status?: TerminalRequestStatus
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.terminalRequestsService.getTerminalRequests(
      pageNum,
      limitNum,
      outletId,
      merchantId,
      status
    );
  }

  @Get(':id')
  @RequirePermissions({ resource: 'terminal', action: 'read' })
  async getTerminalRequestById(@Param('id') id: string) {
    return this.terminalRequestsService.getTerminalRequestById(id);
  }

  @Put(':id')
  @RequirePermissions({ resource: 'terminal', action: 'update' })
  async updateTerminalRequest(
    @Param('id') id: string,
    @Body() updateTerminalRequestDto: UpdateTerminalRequestDto,
    @Request() req: any
  ) {
    const userId = req.user.id;
    return this.terminalRequestsService.updateTerminalRequest(
      id,
      updateTerminalRequestDto,
      userId
    );
  }

  @Post(':id/approve')
  @RequirePermissions({ resource: 'terminal', action: 'update' })
  async approveTerminalRequest(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    return this.terminalRequestsService.approveTerminalRequest(id, userId);
  }

  @Post(':id/reject')
  @RequirePermissions({ resource: 'terminal', action: 'update' })
  async rejectTerminalRequest(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: any
  ) {
    const userId = req.user.id;
    return this.terminalRequestsService.rejectTerminalRequest(
      id,
      userId,
      reason
    );
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'terminal', action: 'delete' })
  async deleteTerminalRequest(@Param('id') id: string) {
    return this.terminalRequestsService.deleteTerminalRequest(id);
  }
}
