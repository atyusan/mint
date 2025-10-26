import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { TerminalInventoryService } from './terminal-inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  BulkImportDto,
  InventoryStatus,
} from './dto/inventory.dto';

@Controller('terminal-inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TerminalInventoryController {
  constructor(private readonly inventoryService: TerminalInventoryService) {}

  @Post()
  @RequirePermissions({ resource: 'terminal', action: 'create' })
  async createInventoryItem(@Body() createDto: CreateInventoryItemDto) {
    return this.inventoryService.createInventoryItem(createDto);
  }

  @Post('bulk-import')
  @RequirePermissions({ resource: 'terminal', action: 'create' })
  async bulkImport(@Body() bulkImportDto: BulkImportDto) {
    return this.inventoryService.bulkImportInventory(bulkImportDto);
  }

  @Get()
  @RequirePermissions({ resource: 'terminal', action: 'read' })
  async getInventory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('modelId') modelId?: string,
    @Query('status') status?: InventoryStatus,
    @Query('serialNumber') serialNumber?: string
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.inventoryService.getInventory(
      pageNum,
      limitNum,
      modelId,
      status,
      serialNumber
    );
  }

  @Get('stock-counts')
  @RequirePermissions({ resource: 'terminal', action: 'read' })
  async getStockCounts() {
    return this.inventoryService.getStockCounts();
  }

  @Get('available/:modelId')
  @RequirePermissions({ resource: 'terminal', action: 'read' })
  async getAvailableCount(@Param('modelId') modelId: string) {
    return this.inventoryService.getAvailableCount(modelId);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'terminal', action: 'read' })
  async getInventoryById(@Param('id') id: string) {
    return this.inventoryService.getInventoryById(id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'terminal', action: 'update' })
  async updateInventoryItem(
    @Param('id') id: string,
    @Body() updateDto: UpdateInventoryItemDto
  ) {
    return this.inventoryService.updateInventoryItem(id, updateDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'terminal', action: 'delete' })
  async deleteInventoryItem(@Param('id') id: string) {
    return this.inventoryService.deleteInventoryItem(id);
  }
}
