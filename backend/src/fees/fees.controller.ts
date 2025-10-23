import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { FeesService } from './fees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('fees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Get('calculate')
  @RequirePermissions({ resource: 'fees', action: 'read' })
  async calculateFee(
    @Request() req,
    @Query('amount') amount: number,
    @Query('merchantId') merchantId?: string,
    @Query('categoryId') categoryId?: string
  ) {
    const userMerchantId = req.user.merchant?.id;
    const finalMerchantId = merchantId || userMerchantId;

    if (!finalMerchantId) {
      throw new Error('Merchant ID is required');
    }

    return this.feesService.getFeeBreakdown(
      amount,
      finalMerchantId,
      categoryId
    );
  }

  @Get('tier/:merchantId')
  @RequirePermissions({ resource: 'fees', action: 'read' })
  async getMerchantTier(@Param('merchantId') merchantId: string) {
    return this.feesService.getMerchantTier(merchantId);
  }

  @Post('tier/:merchantId')
  @RequirePermissions({ resource: 'fees', action: 'update' })
  async updateMerchantTier(
    @Param('merchantId') merchantId: string,
    @Body('tier') tier: string
  ) {
    await this.feesService.updateMerchantTier(merchantId, tier);
    return { message: 'Merchant tier updated successfully' };
  }

  @Get('history/:merchantId')
  @RequirePermissions({ resource: 'fees', action: 'read' })
  async getMerchantFeeHistory(
    @Param('merchantId') merchantId: string,
    @Query('days') days: number = 30
  ) {
    return this.feesService.getMerchantFeeHistory(merchantId, days);
  }
}
