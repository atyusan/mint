import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardMetrics(merchantId?: string, outletId?: string, categoryId?: string) {
    const where: any = {};

    if (merchantId) {
      where.outlet = { merchantId };
    }

    if (outletId) {
      where.outletId = outletId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      cancelledInvoices,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      totalFees,
      netRevenue,
    ] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.count({
        where: { ...where, status: 'PAID' },
      }),
      this.prisma.invoice.count({
        where: { ...where, status: 'PENDING' },
      }),
      this.prisma.invoice.count({
        where: { ...where, status: 'CANCELLED' },
      }),
      this.prisma.invoice.aggregate({
        where,
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: 'PAID' },
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: 'PENDING' },
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: 'PAID' },
        _sum: { fee: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          invoice: where,
          status: 'Success',
        },
        _sum: { netAmount: true },
      }),
    ]);

    const successRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;
    const averageInvoiceValue = totalInvoices > 0 ? Number(totalRevenue._sum.amount) / totalInvoices : 0;

    return {
      overview: {
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        cancelledInvoices,
        successRate: Math.round(successRate * 100) / 100,
        averageInvoiceValue: Math.round(averageInvoiceValue * 100) / 100,
      },
      revenue: {
        total: Number(totalRevenue._sum.amount) || 0,
        paid: Number(paidRevenue._sum.amount) || 0,
        pending: Number(pendingRevenue._sum.amount) || 0,
        fees: Number(totalFees._sum.fee) || 0,
        net: Number(netRevenue._sum.netAmount) || 0,
      },
    };
  }

  async getRevenueTrends(
    merchantId?: string,
    outletId?: string,
    categoryId?: string,
    days: number = 30,
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      createdAt: {
        gte: startDate,
      },
    };

    if (merchantId) {
      where.outlet = { merchantId };
    }

    if (outletId) {
      where.outletId = outletId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const invoices = await this.prisma.invoice.findMany({
      where,
      select: {
        amount: true,
        fee: true,
        status: true,
        createdAt: true,
        category: {
          select: {
            name: true,
            color: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const dailyRevenue = new Map<string, any>();
    const categoryRevenue = new Map<string, any>();

    invoices.forEach((invoice) => {
      const date = invoice.createdAt.toISOString().split('T')[0];
      
      if (!dailyRevenue.has(date)) {
        dailyRevenue.set(date, {
          date,
          total: 0,
          paid: 0,
          pending: 0,
          fees: 0,
        });
      }

      const dayData = dailyRevenue.get(date);
      dayData.total += Number(invoice.amount);
      dayData.fees += Number(invoice.fee);

      if (invoice.status === 'PAID') {
        dayData.paid += Number(invoice.amount);
      } else if (invoice.status === 'PENDING') {
        dayData.pending += Number(invoice.amount);
      }

      // Category breakdown
      if (invoice.category) {
        const categoryName = invoice.category.name;
        if (!categoryRevenue.has(categoryName)) {
          categoryRevenue.set(categoryName, {
            name: categoryName,
            color: invoice.category.color,
            total: 0,
            paid: 0,
            pending: 0,
          });
        }

        const categoryData = categoryRevenue.get(categoryName);
        categoryData.total += Number(invoice.amount);

        if (invoice.status === 'PAID') {
          categoryData.paid += Number(invoice.amount);
        } else if (invoice.status === 'PENDING') {
          categoryData.pending += Number(invoice.amount);
        }
      }
    });

    return {
      daily: Array.from(dailyRevenue.values()),
      byCategory: Array.from(categoryRevenue.values()),
    };
  }

  async getTopPerformingOutlets(merchantId: string, limit: number = 10) {
    const outlets = await this.prisma.outlet.findMany({
      where: { merchantId },
      include: {
        _count: {
          select: {
            invoices: {
              where: { status: 'PAID' },
            },
          },
        },
        invoices: {
          where: { status: 'PAID' },
          select: {
            amount: true,
            createdAt: true,
          },
        },
      },
    });

    const outletPerformance = outlets.map((outlet) => {
      const totalRevenue = outlet.invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
      const invoiceCount = outlet._count.invoices;

      return {
        id: outlet.id,
        name: outlet.name,
        address: outlet.address,
        city: outlet.city,
        state: outlet.state,
        totalRevenue,
        invoiceCount,
        averageInvoiceValue: invoiceCount > 0 ? totalRevenue / invoiceCount : 0,
      };
    });

    return outletPerformance
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }

  async getTopPerformingCategories(merchantId?: string, outletId?: string, limit: number = 10) {
    const where: any = {};

    if (merchantId) {
      where.outlet = { merchantId };
    }

    if (outletId) {
      where.outletId = outletId;
    }

    const categories = await this.prisma.paymentCategory.findMany({
      include: {
        _count: {
          select: {
            invoices: {
              where: { status: 'PAID' },
            },
          },
        },
        invoices: {
          where: { status: 'PAID' },
          select: {
            amount: true,
            createdAt: true,
          },
        },
      },
    });

    const categoryPerformance = categories.map((category) => {
      const totalRevenue = category.invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
      const invoiceCount = category._count.invoices;

      return {
        id: category.id,
        name: category.name,
        color: category.color,
        totalRevenue,
        invoiceCount,
        averageInvoiceValue: invoiceCount > 0 ? totalRevenue / invoiceCount : 0,
      };
    });

    return categoryPerformance
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }

  async getPaymentMethodAnalytics(merchantId?: string, outletId?: string) {
    const where: any = {};

    if (merchantId) {
      where.invoice = {
        outlet: { merchantId },
      };
    }

    if (outletId) {
      where.invoice = {
        outletId,
      };
    }

    const payments = await this.prisma.payment.findMany({
      where: {
        ...where,
        status: 'Success',
      },
      select: {
        method: true,
        amount: true,
        netAmount: true,
        createdAt: true,
      },
    });

    const methodStats = new Map<string, any>();

    payments.forEach((payment) => {
      if (!methodStats.has(payment.method)) {
        methodStats.set(payment.method, {
          method: payment.method,
          count: 0,
          totalAmount: 0,
          netAmount: 0,
        });
      }

      const stats = methodStats.get(payment.method);
      stats.count += 1;
      stats.totalAmount += Number(payment.amount);
      stats.netAmount += Number(payment.netAmount);
    });

    return Array.from(methodStats.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  }

  async getTerminalPerformance(merchantId?: string, outletId?: string) {
    const where: any = {};

    if (merchantId) {
      where.outlet = { merchantId };
    }

    if (outletId) {
      where.outletId = outletId;
    }

    const terminals = await this.prisma.terminal.findMany({
      where,
      include: {
        outlet: {
          select: {
            name: true,
            address: true,
          },
        },
        _count: {
          select: {
            invoices: {
              where: { status: 'PAID' },
            },
          },
        },
        invoices: {
          where: { status: 'PAID' },
          select: {
            amount: true,
            createdAt: true,
          },
        },
      },
    });

    return terminals.map((terminal) => {
      const totalRevenue = terminal.invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
      const invoiceCount = terminal._count.invoices;

      return {
        id: terminal.id,
        serialNumber: terminal.serialNumber,
        model: terminal.model,
        status: terminal.status,
        location: terminal.location,
        outlet: terminal.outlet,
        totalRevenue,
        invoiceCount,
        averageInvoiceValue: invoiceCount > 0 ? totalRevenue / invoiceCount : 0,
        lastSeenAt: terminal.lastSeenAt,
        isOnline: terminal.isOnline,
      };
    });
  }

  async getRealTimeMetrics(merchantId?: string, outletId?: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const where: any = {};

    if (merchantId) {
      where.outlet = { merchantId };
    }

    if (outletId) {
      where.outletId = outletId;
    }

    const [
      todayInvoices,
      yesterdayInvoices,
      todayRevenue,
      yesterdayRevenue,
      activeTerminals,
      pendingPayouts,
    ] = await Promise.all([
      this.prisma.invoice.count({
        where: {
          ...where,
          createdAt: { gte: today },
        },
      }),
      this.prisma.invoice.count({
        where: {
          ...where,
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
      }),
      this.prisma.invoice.aggregate({
        where: {
          ...where,
          status: 'PAID',
          createdAt: { gte: today },
        },
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: {
          ...where,
          status: 'PAID',
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
        _sum: { amount: true },
      }),
      this.prisma.terminal.count({
        where: {
          ...where,
          isOnline: true,
        },
      }),
      this.prisma.payout.count({
        where: {
          merchantId,
          status: 'PENDING',
        },
      }),
    ]);

    const invoiceGrowth = yesterdayInvoices > 0 
      ? ((todayInvoices - yesterdayInvoices) / yesterdayInvoices) * 100 
      : 0;

    const revenueGrowth = yesterdayRevenue._sum.amount 
      ? ((Number(todayRevenue._sum.amount) - Number(yesterdayRevenue._sum.amount)) / Number(yesterdayRevenue._sum.amount)) * 100 
      : 0;

    return {
      today: {
        invoices: todayInvoices,
        revenue: Number(todayRevenue._sum.amount) || 0,
        activeTerminals,
        pendingPayouts,
      },
      growth: {
        invoices: Math.round(invoiceGrowth * 100) / 100,
        revenue: Math.round(revenueGrowth * 100) / 100,
      },
    };
  }
}
