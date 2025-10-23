import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PayoutStatus, PayoutFrequency } from '@prisma/client';

@Injectable()
export class PayoutProcessorService {
  private readonly logger = new Logger(PayoutProcessorService.name);

  constructor(private prisma: PrismaService) {}

  async processScheduledPayouts() {
    this.logger.log('Starting scheduled payout processing...');

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
        merchant: {
          include: {
            user: true,
          },
        },
      },
    });

    this.logger.log(`Found ${scheduledPayouts.length} scheduled payouts`);

    const results = [];

    for (const payout of scheduledPayouts) {
      try {
        await this.processPayout(payout);
        results.push({ 
          payoutId: payout.id, 
          status: 'success',
          amount: payout.amount,
          merchantId: payout.merchantId,
        });
      } catch (error) {
        this.logger.error(`Failed to process payout ${payout.id}:`, error);
        results.push({ 
          payoutId: payout.id, 
          status: 'failed', 
          error: error.message,
          merchantId: payout.merchantId,
        });
      }
    }

    this.logger.log(`Completed payout processing. Success: ${results.filter(r => r.status === 'success').length}, Failed: ${results.filter(r => r.status === 'failed').length}`);

    return results;
  }

  async processPayout(payout: any) {
    this.logger.log(`Processing payout ${payout.id} for merchant ${payout.merchantId}`);

    // Update status to processing
    await this.prisma.payout.update({
      where: { id: payout.id },
      data: { 
        status: PayoutStatus.PROCESSING,
        metadata: {
          ...payout.metadata,
          processingStartedAt: new Date(),
        },
      },
    });

    try {
      // Calculate available balance for payout
      const availableBalance = await this.calculateAvailableBalance(payout.merchantId);
      
      if (availableBalance < payout.amount) {
        throw new Error(`Insufficient balance. Available: ${availableBalance}, Requested: ${payout.amount}`);
      }

      // Process the payout based on method type
      const result = await this.executePayout(payout);

      // Update status to completed
      await this.prisma.payout.update({
        where: { id: payout.id },
        data: {
          status: PayoutStatus.COMPLETED,
          processedAt: new Date(),
          metadata: {
            ...payout.metadata,
            processingResult: result,
            completedAt: new Date(),
          },
        },
      });

      // Create next scheduled payout if frequency is set
      await this.scheduleNextPayout(payout);

      this.logger.log(`Successfully processed payout ${payout.id}`);
    } catch (error) {
      this.logger.error(`Failed to process payout ${payout.id}:`, error);

      // Update status to failed
      await this.prisma.payout.update({
        where: { id: payout.id },
        data: {
          status: PayoutStatus.FAILED,
          metadata: {
            ...payout.metadata,
            error: error.message,
            failedAt: new Date(),
          },
        },
      });

      throw error;
    }
  }

  async calculateAvailableBalance(merchantId: string): Promise<number> {
    // Get all paid invoices for the merchant
    const paidInvoices = await this.prisma.invoice.aggregate({
      where: {
        outlet: { merchantId },
        status: 'PAID',
      },
      _sum: { amount: true },
    });

    // Get all completed payouts for the merchant
    const completedPayouts = await this.prisma.payout.aggregate({
      where: {
        merchantId,
        status: PayoutStatus.COMPLETED,
      },
      _sum: { amount: true },
    });

    // Get all pending payouts for the merchant
    const pendingPayouts = await this.prisma.payout.aggregate({
      where: {
        merchantId,
        status: {
          in: [PayoutStatus.PENDING, PayoutStatus.PROCESSING],
        },
      },
      _sum: { amount: true },
    });

    const totalRevenue = Number(paidInvoices._sum.amount) || 0;
    const totalPaidOut = Number(completedPayouts._sum.amount) || 0;
    const totalPending = Number(pendingPayouts._sum.amount) || 0;

    const availableBalance = totalRevenue - totalPaidOut - totalPending;

    return Math.max(0, availableBalance);
  }

  private async executePayout(payout: any): Promise<any> {
    const { payoutMethod } = payout;

    switch (payoutMethod.methodType) {
      case 'BANK_ACCOUNT':
        return this.processBankTransfer(payout);
      case 'MOBILE_MONEY':
        return this.processMobileMoneyTransfer(payout);
      default:
        throw new Error(`Unsupported payout method: ${payoutMethod.methodType}`);
    }
  }

  private async processBankTransfer(payout: any): Promise<any> {
    // TODO: Integrate with actual bank transfer API
    // For now, simulate processing
    this.logger.log(`Processing bank transfer for payout ${payout.id}`);
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

    return {
      method: 'BANK_ACCOUNT',
      reference: `BANK-${Date.now()}`,
      status: 'completed',
      processedAt: new Date(),
    };
  }

  private async processMobileMoneyTransfer(payout: any): Promise<any> {
    // TODO: Integrate with mobile money API
    // For now, simulate processing
    this.logger.log(`Processing mobile money transfer for payout ${payout.id}`);
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time

    return {
      method: 'MOBILE_MONEY',
      reference: `MM-${Date.now()}`,
      status: 'completed',
      processedAt: new Date(),
    };
  }

  private async scheduleNextPayout(payout: any) {
    if (!payout.frequency || payout.frequency === 'ONCE') {
      return;
    }

    const nextScheduledDate = this.calculateNextScheduledDate(payout.frequency);
    
    await this.prisma.payout.create({
      data: {
        merchantId: payout.merchantId,
        payoutMethodId: payout.payoutMethodId,
        amount: 0, // Will be calculated based on available balance
        fee: 0,
        netAmount: 0,
        currency: payout.currency,
        status: PayoutStatus.PENDING,
        frequency: payout.frequency,
        reference: await this.generatePayoutReference(),
        scheduledFor: nextScheduledDate,
        metadata: {
          autoGenerated: true,
          parentPayoutId: payout.id,
        },
      },
    });

    this.logger.log(`Scheduled next payout for merchant ${payout.merchantId} on ${nextScheduledDate}`);
  }

  private calculateNextScheduledDate(frequency: PayoutFrequency): Date {
    const now = new Date();
    const nextDate = new Date(now);

    switch (frequency) {
      case PayoutFrequency.DAILY:
        nextDate.setDate(now.getDate() + 1);
        break;
      case PayoutFrequency.WEEKLY:
        nextDate.setDate(now.getDate() + 7);
        break;
      case PayoutFrequency.MONTHLY:
        nextDate.setMonth(now.getMonth() + 1);
        break;
      default:
        nextDate.setDate(now.getDate() + 1);
    }

    return nextDate;
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

  async getPayoutSummary(merchantId: string) {
    const [
      totalPayouts,
      completedPayouts,
      pendingPayouts,
      failedPayouts,
      totalAmount,
      completedAmount,
      pendingAmount,
      availableBalance,
    ] = await Promise.all([
      this.prisma.payout.count({ where: { merchantId } }),
      this.prisma.payout.count({ 
        where: { merchantId, status: PayoutStatus.COMPLETED } 
      }),
      this.prisma.payout.count({ 
        where: { merchantId, status: PayoutStatus.PENDING } 
      }),
      this.prisma.payout.count({ 
        where: { merchantId, status: PayoutStatus.FAILED } 
      }),
      this.prisma.payout.aggregate({
        where: { merchantId },
        _sum: { amount: true },
      }),
      this.prisma.payout.aggregate({
        where: { merchantId, status: PayoutStatus.COMPLETED },
        _sum: { amount: true },
      }),
      this.prisma.payout.aggregate({
        where: { merchantId, status: PayoutStatus.PENDING },
        _sum: { amount: true },
      }),
      this.calculateAvailableBalance(merchantId),
    ]);

    return {
      summary: {
        totalPayouts,
        completedPayouts,
        pendingPayouts,
        failedPayouts,
        successRate: totalPayouts > 0 ? (completedPayouts / totalPayouts) * 100 : 0,
      },
      amounts: {
        total: Number(totalAmount._sum.amount) || 0,
        completed: Number(completedAmount._sum.amount) || 0,
        pending: Number(pendingAmount._sum.amount) || 0,
        available: availableBalance,
      },
    };
  }
}
