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
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { InvoiceStatus } from '@prisma/client';

@Controller('invoices')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @RequirePermissions({ resource: 'invoice', action: 'create' })
  async create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
    return this.invoicesService.createInvoice(createInvoiceDto, req.user.id);
  }

  @Get()
  @RequirePermissions({ resource: 'invoice', action: 'read' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('outletId') outletId?: string,
    @Query('status') status?: InvoiceStatus,
    @Query('categoryId') categoryId?: string,
    @Query('merchantId') merchantId?: string,
  ) {
    return this.invoicesService.getInvoices(page, limit, outletId, status, categoryId, merchantId);
  }

  @Get('stats')
  @RequirePermissions({ resource: 'invoice', action: 'read' })
  async getStats(
    @Query('outletId') outletId?: string,
    @Query('merchantId') merchantId?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.invoicesService.getInvoiceStats(outletId, merchantId, categoryId);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'invoice', action: 'read' })
  async findOne(@Param('id') id: string) {
    return this.invoicesService.getInvoiceById(id);
  }

  @Get(':id/activity')
  @RequirePermissions({ resource: 'invoice', action: 'read' })
  async getActivity(@Param('id') id: string) {
    return this.invoicesService.getInvoiceActivity(id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'invoice', action: 'update' })
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @Request() req,
  ) {
    return this.invoicesService.updateInvoice(id, updateInvoiceDto, req.user.id);
  }

  @Patch(':id/cancel')
  @RequirePermissions({ resource: 'invoice', action: 'update' })
  async cancel(@Param('id') id: string, @Request() req) {
    return this.invoicesService.cancelInvoice(id, req.user.id);
  }
}
