import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @RequirePermissions({ resource: 'analytics', action: 'read' })
  async getDashboardMetrics(
    @Request() req,
    @Query('merchantId') merchantId?: string,
    @Query('outletId') outletId?: string,
    @Query('categoryId') categoryId?: string
  ) {
    const userMerchantId = req.user.merchant?.id;
    const finalMerchantId = merchantId || userMerchantId;

    if (!finalMerchantId) {
      // Return empty dashboard data for users without merchant association
      return {
        overview: {
          totalInvoices: 0,
          totalRevenue: 0,
          totalFees: 0,
          netRevenue: 0,
          successRate: 0,
          averageTransaction: 0,
        },
        revenue: {
          total: 0,
          paid: 0,
          pending: 0,
          fees: 0,
          net: 0,
        },
        message:
          'No merchant association found. Please contact support to set up your merchant account.',
      };
    }

    return this.analyticsService.getDashboardMetrics(
      finalMerchantId,
      outletId,
      categoryId
    );
  }

  @Get('revenue-trends')
  @RequirePermissions({ resource: 'analytics', action: 'read' })
  async getRevenueTrends(
    @Request() req,
    @Query('merchantId') merchantId?: string,
    @Query('outletId') outletId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('days') days?: number
  ) {
    const userMerchantId = req.user.merchant?.id;
    const finalMerchantId = merchantId || userMerchantId;

    if (!finalMerchantId) {
      // Return empty revenue trends for users without merchant association
      return {
        data: [],
        message:
          'No merchant association found. Please contact support to set up your merchant account.',
      };
    }

    return this.analyticsService.getRevenueTrends(
      finalMerchantId,
      outletId,
      categoryId,
      days
    );
  }

  @Get('top-outlets')
  @RequirePermissions({ resource: 'analytics', action: 'read' })
  async getTopPerformingOutlets(
    @Request() req,
    @Query('merchantId') merchantId?: string,
    @Query('limit') limit?: number
  ) {
    const userMerchantId = req.user.merchant?.id;
    const finalMerchantId = merchantId || userMerchantId;

    if (!finalMerchantId) {
      // Return empty data for users without merchant association
      return {
        data: [],
        total: 0,
        message:
          'No merchant association found. Please contact support to set up your merchant account.',
      };
    }

    return this.analyticsService.getTopPerformingOutlets(
      finalMerchantId,
      limit
    );
  }

  @Get('top-categories')
  @RequirePermissions({ resource: 'analytics', action: 'read' })
  async getTopPerformingCategories(
    @Request() req,
    @Query('merchantId') merchantId?: string,
    @Query('outletId') outletId?: string,
    @Query('limit') limit?: number
  ) {
    const userMerchantId = req.user.merchant?.id;
    const finalMerchantId = merchantId || userMerchantId;

    return this.analyticsService.getTopPerformingCategories(
      finalMerchantId,
      outletId,
      limit
    );
  }

  @Get('payment-methods')
  @RequirePermissions({ resource: 'analytics', action: 'read' })
  async getPaymentMethodAnalytics(
    @Request() req,
    @Query('merchantId') merchantId?: string,
    @Query('outletId') outletId?: string
  ) {
    const userMerchantId = req.user.merchant?.id;
    const finalMerchantId = merchantId || userMerchantId;

    return this.analyticsService.getPaymentMethodAnalytics(
      finalMerchantId,
      outletId
    );
  }

  @Get('terminal-performance')
  @RequirePermissions({ resource: 'analytics', action: 'read' })
  async getTerminalPerformance(
    @Request() req,
    @Query('merchantId') merchantId?: string,
    @Query('outletId') outletId?: string
  ) {
    const userMerchantId = req.user.merchant?.id;
    const finalMerchantId = merchantId || userMerchantId;

    if (!finalMerchantId) {
      // Return empty terminal performance data for users without merchant association
      return {
        data: [],
        message:
          'No merchant association found. Please contact support to set up your merchant account.',
      };
    }

    return this.analyticsService.getTerminalPerformance(
      finalMerchantId,
      outletId
    );
  }

  @Get('real-time')
  @RequirePermissions({ resource: 'analytics', action: 'read' })
  async getRealTimeMetrics(
    @Request() req,
    @Query('merchantId') merchantId?: string,
    @Query('outletId') outletId?: string
  ) {
    const userMerchantId = req.user.merchant?.id;
    const finalMerchantId = merchantId || userMerchantId;

    return this.analyticsService.getRealTimeMetrics(finalMerchantId, outletId);
  }
}
