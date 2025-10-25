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
  ParseIntPipe,
} from '@nestjs/common';
import { OutletsService } from './outlets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import {
  CreateOutletDto,
  UpdateOutletDto,
  OutletSearchDto,
} from './dto/outlet.dto';

@Controller('outlets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OutletsController {
  constructor(private readonly outletsService: OutletsService) {}

  @Post()
  @RequirePermissions({ resource: 'outlet', action: 'create' })
  async createOutlet(@Body() createOutletDto: CreateOutletDto) {
    return this.outletsService.createOutlet(createOutletDto);
  }

  @Get()
  @RequirePermissions({ resource: 'outlet', action: 'read' })
  async getOutlets(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('merchantId') merchantId?: string,
    @Query('isActive') isActive?: string
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.outletsService.getOutlets(
      pageNum,
      limitNum,
      search,
      city,
      state,
      merchantId,
      isActive
    );
  }

  @Get(':id')
  @RequirePermissions({ resource: 'outlet', action: 'read' })
  async getOutletById(@Param('id') id: string) {
    return this.outletsService.getOutletById(id);
  }

  @Put(':id')
  @RequirePermissions({ resource: 'outlet', action: 'update' })
  async updateOutlet(
    @Param('id') id: string,
    @Body() updateOutletDto: UpdateOutletDto
  ) {
    return this.outletsService.updateOutlet(id, updateOutletDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'outlet', action: 'delete' })
  async deleteOutlet(@Param('id') id: string) {
    return this.outletsService.deleteOutlet(id);
  }

  @Get('merchant/:merchantId')
  @RequirePermissions({ resource: 'outlet', action: 'read' })
  async getMerchantOutlets(@Param('merchantId') merchantId: string) {
    return this.outletsService.getMerchantOutlets(merchantId);
  }

  @Get(':id/stats')
  @RequirePermissions({ resource: 'outlet', action: 'read' })
  async getOutletStats(@Param('id') id: string) {
    return this.outletsService.getOutletStats(id);
  }
}
