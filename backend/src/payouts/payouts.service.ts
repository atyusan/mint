import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PayoutStatus, PayoutFrequency } from '@prisma/client';
import { CreatePayoutDto, CreatePayoutMethodDto, UpdatePayoutMethodDto } from './dto';

@Injectable()
export class PayoutsService {
  constructor(private prisma: PrismaService) {}

  async createPayoutMethod(createPayoutMethodDto: CreatePayoutMethodDto, merchantId: string) {
    const { isDefault, ...methodData } = createPayoutMethodDto;

    // If this is set as default, unset other default methods
    if (isDefault) {
      await this.prisma.payoutMethod.updateMany({
        where: {
          merchantId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const payoutMethod = await this.prisma.payoutMethod.create({
      data: {
        ...methodData,
        merchantId,
        isDefault: isDefault || false,
      },
    });

    return payoutMethod;
  }

  async getPayoutMethods(merchantId: string) {
    return this.prisma.payoutMethod.findMany({
      where: {
        merchantId,
        isActive: true,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async getPayoutMethodById(id: string, merchantId: string) {
    const payoutMethod = await this.prisma.payoutMethod.findFirst({
      where: {
        id,
        merchantId,
      },
    });

    if (!payoutMethod) {
      throw new NotFoundException('Payout method not found');
    }

    return payoutMethod;
  }

  async updatePayoutMethod(
    id: string,
    updatePayoutMethodDto: UpdatePayoutMethodDto,
    merchantId: string,
  ) {
    const payoutMethod = await this.getPayoutMethodById(id, merchantId);

    const { isDefault, ...updateData } = updatePayoutMethodDto;

    // If this is set as default, unset other default methods
    if (isDefault && !payoutMethod.isDefault) {
      await this.prisma.payoutMethod.updateMany({
        where: {
          merchantId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const updatedPayoutMethod = await this.prisma.payoutMethod.update({
      where: { id },
      data: {
        ...updateData,
        isDefault: isDefault !== undefined ? isDefault : payoutMethod.isDefault,
      },
    });

    return updatedPayoutMethod;
  }

  async deletePayoutMethod(id: string, merchantId: string) {
    const payoutMethod = await this.getPayoutMethodById(id, merchantId);

    // Check if this is the only payout method
    const methodCount = await this.prisma.payoutMethod.count({
      where: {
        merchantId,
        isActive: true,
      },
    });

    if (methodCount <= 1) {
      throw new BadRequestException('Cannot delete the only payout method');
    }

    // Check if there are pending payouts using this method
    const pendingPayouts = await this.prisma.payout.count({
      where: {
        payoutMethodId: id,
        status: {
          in: [PayoutStatus.PENDING, PayoutStatus.PROCESSING],
        },
      },
    });

    if (pendingPayouts > 0) {
      throw new BadRequestException(
        'Cannot delete payout method with pending payouts. Please wait for payouts to complete.',
      );
    }

    await this.prisma.payoutMethod.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return { message: 'Payout method deleted successfully' };
  }

  async createPayout(createPayoutDto: CreatePayoutDto, merchantId: string) {
    const { payoutMethodId, frequency, ...payoutData } = createPayoutDto;

    // Verify payout method belongs to merchant
    const payoutMethod = await this.getPayoutMethodById(payoutMethodId, merchantId);

    // Calculate scheduled date based on frequency
    const scheduledFor = this.calculateScheduledDate(frequency);

    // Generate unique reference
    const reference = await this.generatePayoutReference();

    const payout = await this.prisma.payout.create({
      data: {
        ...payoutData,
        merchantId,
        payoutMethodId,
        frequency,
        reference,
        scheduledFor,
      },
    });

    return this.getPayoutById(payout.id, merchantId);
  }

  async getPayouts(
    merchantId: string,
    page: number = 1,
    limit: number = 10,
    status?: PayoutStatus,
    frequency?: PayoutFrequency,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      merchantId,
    };

    if (status) {
      where.status = status;
    }

    if (frequency) {
      where.frequency = frequency;
    }

    const [payouts, total] = await Promise.all([
      this.prisma.payout.findMany({
        where,
        skip,
        take: limit,
        include: {
          payoutMethod: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payout.count({ where }),
    ]);

    return {
      payouts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getPayoutById(id: string, merchantId: string) {
    const payout = await this.prisma.payout.findFirst({
      where: {
        id,
        merchantId,
      },
      include: {
        payoutMethod: true,
      },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    return payout;
  }

  async getPayoutStats(merchantId: string) {
    const [
      totalPayouts,
      pendingPayouts,
      completedPayouts,
      failedPayouts,
      totalAmount,
      pendingAmount,
      completedAmount,
    ] = await Promise.all([
      this.prisma.payout.count({
        where: { merchantId },
      }),
      this.prisma.payout.count({
        where: { merchantId, status: PayoutStatus.PENDING },
      }),
      this.prisma.payout.count({
        where: { merchantId, status: PayoutStatus.COMPLETED },
      }),
      this.prisma.payout.count({
        where: { merchantId, status: PayoutStatus.FAILED },
      }),
      this.prisma.payout.aggregate({
        where: { merchantId },
        _sum: { amount: true },
      }),
      this.prisma.payout.aggregate({
        where: { merchantId, status: PayoutStatus.PENDING },
        _sum: { amount: true },
      }),
      this.prisma.payout.aggregate({
        where: { merchantId, status: PayoutStatus.COMPLETED },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalPayouts,
      pendingPayouts,
      completedPayouts,
      failedPayouts,
      totalAmount: totalAmount._sum.amount || 0,
      pendingAmount: pendingAmount._sum.amount || 0,
      completedAmount: completedAmount._sum.amount || 0,
      successRate: totalPayouts > 0 ? (completedPayouts / totalPayouts) * 100 : 0,
    };
  }

  async processScheduledPayouts() {
    const now = new Date();
    const scheduledPayouts = await this.prisma.payout.findMany({
      where: {
        status: PayoutStatus.PENDING,
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        payoutMethod: true,
        merchant: true,
      },
    });

    const results = [];

    for (const payout of scheduledPayouts) {
      try {
        await this.processPayout(payout);
        results.push({ payoutId: payout.id, status: 'success' });
      } catch (error) {
        results.push({ payoutId: payout.id, status: 'failed', error: error.message });
      }
    }

    return results;
  }

  private async processPayout(payout: any) {
    // Update status to processing
    await this.prisma.payout.update({
      where: { id: payout.id },
      data: { status: PayoutStatus.PROCESSING },
    });

    try {
      // TODO: Integrate with actual payout provider (bank API, mobile money, etc.)
      // For now, we'll simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update status to completed
      await this.prisma.payout.update({
        where: { id: payout.id },
        data: {
          status: PayoutStatus.COMPLETED,
          processedAt: new Date(),
        },
      });
    } catch (error) {
      // Update status to failed
      await this.prisma.payout.update({
        where: { id: payout.id },
        data: {
          status: PayoutStatus.FAILED,
          metadata: {
            ...payout.metadata,
            error: error.message,
          },
        },
      });
      throw error;
    }
  }

  private calculateScheduledDate(frequency: PayoutFrequency): Date {
    const now = new Date();
    const scheduledDate = new Date(now);

    switch (frequency) {
      case PayoutFrequency.DAILY:
        scheduledDate.setDate(now.getDate() + 1);
        break;
      case PayoutFrequency.WEEKLY:
        scheduledDate.setDate(now.getDate() + 7);
        break;
      case PayoutFrequency.MONTHLY:
        scheduledDate.setMonth(now.getMonth() + 1);
        break;
      default:
        scheduledDate.setDate(now.getDate() + 1);
    }

    return scheduledDate;
  }

  private async generatePayoutReference(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const prefix = `PAY-${year}${month}${day}`;

    const lastPayout = await this.prisma.payout.findFirst({
      where: {
        reference: {
          startsWith: prefix,
        },
      },
      orderBy: { reference: 'desc' },
    });

    let sequence = 1;
    if (lastPayout) {
      const lastSequence = parseInt(lastPayout.reference.split('-')[1].slice(8));
      sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }
}
