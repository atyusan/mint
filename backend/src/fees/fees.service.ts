import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface FeeStructure {
  percentage: number;
  minimum: number;
  maximum: number;
  fixed?: number;
}

export interface MerchantTier {
  name: string;
  description: string;
  feeStructure: FeeStructure;
  requirements: {
    monthlyVolume?: number;
    transactionCount?: number;
    accountAge?: number; // in days
  };
}

@Injectable()
export class FeesService {
  private readonly merchantTiers: MerchantTier[] = [
    {
      name: 'basic',
      description: 'Basic tier for new merchants',
      feeStructure: {
        percentage: 0.035, // 3.5%
        minimum: 50, // 50 kobo
        maximum: 5000, // 50 naira
      },
      requirements: {
        monthlyVolume: 0,
        transactionCount: 0,
        accountAge: 0,
      },
    },
    {
      name: 'standard',
      description: 'Standard tier for established merchants',
      feeStructure: {
        percentage: 0.025, // 2.5%
        minimum: 50, // 50 kobo
        maximum: 2000, // 20 naira
      },
      requirements: {
        monthlyVolume: 100000, // 100k naira
        transactionCount: 100,
        accountAge: 30,
      },
    },
    {
      name: 'premium',
      description: 'Premium tier for high-volume merchants',
      feeStructure: {
        percentage: 0.015, // 1.5%
        minimum: 50, // 50 kobo
        maximum: 1000, // 10 naira
      },
      requirements: {
        monthlyVolume: 1000000, // 1M naira
        transactionCount: 1000,
        accountAge: 90,
      },
    },
    {
      name: 'enterprise',
      description: 'Enterprise tier for large businesses',
      feeStructure: {
        percentage: 0.01, // 1%
        minimum: 50, // 50 kobo
        maximum: 500, // 5 naira
      },
      requirements: {
        monthlyVolume: 5000000, // 5M naira
        transactionCount: 5000,
        accountAge: 180,
      },
    },
  ];

  constructor(private prisma: PrismaService) {}

  async calculateFee(
    amount: number,
    merchantId: string,
    categoryId?: string
  ): Promise<number> {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      include: {
        user: true,
      },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Get merchant's current tier
    const merchantTier = await this.getMerchantTier(merchantId);

    // Get category-specific fee if applicable
    let categoryFeeMultiplier = 1;
    if (categoryId) {
      const category = await this.prisma.paymentCategory.findUnique({
        where: { id: categoryId },
      });

      // Category-specific fee logic can be implemented here
      // For now, we'll use a simple mapping
      if (category) {
        switch (category.name.toLowerCase()) {
          case 'healthcare':
            categoryFeeMultiplier = 0.8; // Lower fees for healthcare
            break;
          case 'education':
            categoryFeeMultiplier = 0.9; // Lower fees for education
            break;
          default:
            categoryFeeMultiplier = 1;
        }
      }
    }

    // Calculate base fee
    const baseFee = this.calculateBaseFee(amount, merchantTier.feeStructure);

    // Apply category multiplier
    const finalFee = baseFee * categoryFeeMultiplier;

    return Math.round(finalFee * 100) / 100; // Round to 2 decimal places
  }

  async getMerchantTier(merchantId: string): Promise<MerchantTier> {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Get merchant's performance metrics
    const metrics = await this.getMerchantMetrics(merchantId);

    // Determine tier based on performance
    for (let i = this.merchantTiers.length - 1; i >= 0; i--) {
      const tier = this.merchantTiers[i];
      if (this.meetsTierRequirements(metrics, tier.requirements)) {
        return tier;
      }
    }

    // Default to basic tier
    return this.merchantTiers[0];
  }

  async updateMerchantTier(merchantId: string, newTier: string): Promise<void> {
    const tier = this.merchantTiers.find((t) => t.name === newTier);
    if (!tier) {
      throw new NotFoundException('Invalid tier');
    }

    // For now, we'll store tier information in the description field
    // In a real implementation, you might want to add a metadata field to the schema
    await this.prisma.merchant.update({
      where: { id: merchantId },
      data: {
        description: `Tier: ${newTier} - Updated: ${new Date().toISOString()}`,
      },
    });
  }

  async getFeeBreakdown(
    amount: number,
    merchantId: string,
    categoryId?: string
  ) {
    const fee = await this.calculateFee(amount, merchantId, categoryId);
    const netAmount = amount - fee;
    const feePercentage = (fee / amount) * 100;

    return {
      amount,
      fee,
      netAmount,
      feePercentage: Math.round(feePercentage * 100) / 100,
      breakdown: {
        baseAmount: amount,
        feeAmount: fee,
        netAmount,
      },
    };
  }

  async getMerchantFeeHistory(merchantId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const fees = await this.prisma.invoice.findMany({
      where: {
        outlet: {
          merchantId,
        },
        createdAt: {
          gte: startDate,
        },
        status: 'PAID',
      },
      select: {
        amount: true,
        fee: true,
        createdAt: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalFees = fees.reduce(
      (sum, invoice) => sum + Number(invoice.fee),
      0
    );
    const totalAmount = fees.reduce(
      (sum, invoice) => sum + Number(invoice.amount),
      0
    );
    const averageFeePercentage =
      totalAmount > 0 ? (totalFees / totalAmount) * 100 : 0;

    return {
      period: {
        days,
        startDate,
        endDate: new Date(),
      },
      summary: {
        totalFees,
        totalAmount,
        averageFeePercentage: Math.round(averageFeePercentage * 100) / 100,
        transactionCount: fees.length,
      },
      fees: fees.map((invoice) => ({
        amount: Number(invoice.amount),
        fee: Number(invoice.fee),
        feePercentage:
          Number(invoice.amount) > 0
            ? (Number(invoice.fee) / Number(invoice.amount)) * 100
            : 0,
        category: invoice.category?.name || 'Uncategorized',
        date: invoice.createdAt,
      })),
    };
  }

  private calculateBaseFee(amount: number, feeStructure: FeeStructure): number {
    const { percentage, minimum, maximum, fixed } = feeStructure;

    if (fixed !== undefined) {
      return fixed;
    }

    const calculatedFee = amount * percentage;
    return Math.max(minimum, Math.min(calculatedFee, maximum));
  }

  private async getMerchantMetrics(merchantId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [volume, transactionCount, accountAge] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: {
          outlet: { merchantId },
          status: 'PAID',
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { amount: true },
      }),
      this.prisma.invoice.count({
        where: {
          outlet: { merchantId },
          status: 'PAID',
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.merchant.findUnique({
        where: { id: merchantId },
        select: { createdAt: true },
      }),
    ]);

    const accountAgeInDays = accountAge
      ? Math.floor(
          (Date.now() - accountAge.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    return {
      monthlyVolume: Number(volume._sum.amount) || 0,
      transactionCount,
      accountAge: accountAgeInDays,
    };
  }

  private meetsTierRequirements(metrics: any, requirements: any): boolean {
    return (
      metrics.monthlyVolume >= (requirements.monthlyVolume || 0) &&
      metrics.transactionCount >= (requirements.transactionCount || 0) &&
      metrics.accountAge >= (requirements.accountAge || 0)
    );
  }
}
