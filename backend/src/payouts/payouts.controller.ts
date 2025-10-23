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
import { PayoutsService } from './payouts.service';
import {
  CreatePayoutDto,
  CreatePayoutMethodDto,
  UpdatePayoutMethodDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PayoutStatus, PayoutFrequency } from '@prisma/client';

@Controller('payouts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  // Payout Methods
  @Post('methods')
  @RequirePermissions({ resource: 'payout', action: 'create' })
  async createPayoutMethod(
    @Body() createPayoutMethodDto: CreatePayoutMethodDto,
    @Request() req
  ) {
    return this.payoutsService.createPayoutMethod(
      createPayoutMethodDto,
      req.user.merchant?.id || req.user.id
    );
  }

  @Get('methods')
  @RequirePermissions({ resource: 'payout', action: 'read' })
  async getPayoutMethods(@Request() req) {
    return this.payoutsService.getPayoutMethods(
      req.user.merchant?.id || req.user.id
    );
  }

  @Get('methods/:id')
  @RequirePermissions({ resource: 'payout', action: 'read' })
  async getPayoutMethodById(@Param('id') id: string, @Request() req) {
    return this.payoutsService.getPayoutMethodById(
      id,
      req.user.merchant?.id || req.user.id
    );
  }

  @Patch('methods/:id')
  @RequirePermissions({ resource: 'payout', action: 'update' })
  async updatePayoutMethod(
    @Param('id') id: string,
    @Body() updatePayoutMethodDto: UpdatePayoutMethodDto,
    @Request() req
  ) {
    return this.payoutsService.updatePayoutMethod(
      id,
      updatePayoutMethodDto,
      req.user.merchant?.id || req.user.id
    );
  }

  @Delete('methods/:id')
  @RequirePermissions({ resource: 'payout', action: 'delete' })
  async deletePayoutMethod(@Param('id') id: string, @Request() req) {
    return this.payoutsService.deletePayoutMethod(
      id,
      req.user.merchant?.id || req.user.id
    );
  }

  // Payouts
  @Post()
  @RequirePermissions({ resource: 'payout', action: 'create' })
  async createPayout(@Body() createPayoutDto: CreatePayoutDto, @Request() req) {
    return this.payoutsService.createPayout(
      createPayoutDto,
      req.user.merchant?.id || req.user.id
    );
  }

  @Get()
  @RequirePermissions({ resource: 'payout', action: 'read' })
  async getPayouts(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: PayoutStatus,
    @Query('frequency') frequency?: PayoutFrequency
  ) {
    return this.payoutsService.getPayouts(
      req.user.merchant?.id || req.user.id,
      page,
      limit,
      status,
      frequency
    );
  }

  @Get('stats')
  @RequirePermissions({ resource: 'payout', action: 'read' })
  async getPayoutStats(@Request() req) {
    return this.payoutsService.getPayoutStats(
      req.user.merchant?.id || req.user.id
    );
  }

  @Get(':id')
  @RequirePermissions({ resource: 'payout', action: 'read' })
  async getPayoutById(@Param('id') id: string, @Request() req) {
    return this.payoutsService.getPayoutById(
      id,
      req.user.merchant?.id || req.user.id
    );
  }

  @Post('process-scheduled')
  @RequirePermissions({ resource: 'payout', action: 'update' })
  async processScheduledPayouts() {
    return this.payoutsService.processScheduledPayouts();
  }
}
