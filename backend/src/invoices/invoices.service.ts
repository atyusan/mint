import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaystackService } from '../paystack/paystack.service';
import { FeesService } from '../fees/fees.service';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private paystackService: PaystackService,
    private feesService: FeesService
  ) {}

  async createInvoice(createInvoiceDto: CreateInvoiceDto, createdBy: string) {
    const { outletId, terminalId, categoryId, ...invoiceData } =
      createInvoiceDto;

    // Verify outlet exists and user has access
    const outlet = await this.prisma.outlet.findUnique({
      where: { id: outletId },
      include: {
        merchant: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!outlet) {
      throw new NotFoundException('Outlet not found');
    }

    // Verify merchant is active
    if (outlet.merchant.user.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Cannot create invoice for inactive merchant'
      );
    }

    // Verify outlet has at least one terminal
    const outletTerminals = await this.prisma.terminal.findMany({
      where: { outletId },
    });

    if (outletTerminals.length === 0) {
      throw new BadRequestException(
        'Cannot create invoice for outlet without terminals'
      );
    }

    // Verify terminal exists and belongs to outlet
    if (terminalId) {
      const terminal = await this.prisma.terminal.findUnique({
        where: { id: terminalId },
      });

      if (!terminal || terminal.outletId !== outletId) {
        throw new BadRequestException(
          'Terminal not found or does not belong to outlet'
        );
      }
    }

    // Generate unique invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate fees using the new fees service
    const fee = await this.feesService.calculateFee(
      invoiceData.amount,
      outlet.merchantId,
      categoryId
    );
    const totalAmount = invoiceData.amount + fee;

    // Create invoice
    const invoice = await this.prisma.invoice.create({
      data: {
        ...invoiceData,
        outletId,
        terminalId,
        categoryId,
        invoiceNumber,
        fee,
        totalAmount,
      },
    });

    // Create Paystack customer if doesn't exist
    let paystackCustomer = await this.prisma.paystackCustomer.findFirst({
      where: {
        merchantId: outlet.merchantId,
      },
    });

    if (!paystackCustomer && invoiceData.customerEmail) {
      const customerData = await this.paystackService.createCustomer({
        email: invoiceData.customerEmail,
        first_name: invoiceData.customerName?.split(' ')[0],
        last_name: invoiceData.customerName?.split(' ').slice(1).join(' '),
        phone: invoiceData.customerPhone,
        metadata: {
          merchantId: outlet.merchantId,
          outletId: outletId,
        },
      });

      paystackCustomer = await this.prisma.paystackCustomer.create({
        data: {
          merchantId: outlet.merchantId,
          paystackCustomerId: customerData.id,
          customerCode: customerData.customer_code,
          email: invoiceData.customerEmail,
          firstName: customerData.first_name,
          lastName: customerData.last_name,
          phone: invoiceData.customerPhone,
        },
      });
    }

    // Create Paystack payment request
    if (paystackCustomer) {
      const paymentRequestData = {
        customer: paystackCustomer.customerCode,
        amount: Math.round(totalAmount * 100), // Convert to kobo
        description: invoiceData.description || `Invoice ${invoiceNumber}`,
        line_items: [
          {
            name: invoiceData.description || 'Service',
            amount: Math.round(invoiceData.amount * 100),
            quantity: 1,
          },
        ],
        due_date: invoiceData.dueDate
          ? new Date(invoiceData.dueDate).toISOString()
          : undefined,
        metadata: {
          invoiceId: invoice.id,
          outletId: outletId,
          merchantId: outlet.merchantId,
        },
      };

      const paystackInvoice =
        await this.paystackService.createPaymentRequest(paymentRequestData);

      // Store Paystack invoice reference
      await this.prisma.paystackInvoice.create({
        data: {
          invoiceId: invoice.id,
          paystackInvoiceId: paystackInvoice.id,
          requestCode: paystackInvoice.request_code,
          status: paystackInvoice.status,
          amount: totalAmount,
          currency: invoiceData.currency || 'NGN',
          description: invoiceData.description,
          lineItems: paymentRequestData.line_items,
        },
      });
    }

    // Log the creation
    await this.logInvoiceAction(
      createdBy,
      'CREATE',
      'INVOICE',
      invoice.id,
      null,
      invoice
    );

    return this.getInvoiceById(invoice.id);
  }

  async getInvoices(
    page: number = 1,
    limit: number = 10,
    outletId?: string,
    status?: InvoiceStatus,
    categoryId?: string,
    merchantId?: string
  ) {
    // Ensure page and limit are valid numbers
    const validPage = isNaN(page) || page < 1 ? 1 : page;
    const validLimit = isNaN(limit) || limit < 1 ? 10 : limit;
    const skip = (validPage - 1) * validLimit;

    const where: any = {};

    if (outletId) {
      where.outletId = outletId;
    }

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (merchantId) {
      where.outlet = {
        merchantId,
      };
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: validLimit,
        include: {
          outlet: {
            include: {
              merchant: {
                include: {
                  user: true,
                },
              },
            },
          },
          terminal: true,
          category: true,
          payments: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getInvoiceById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        outlet: {
          include: {
            merchant: {
              include: {
                user: true,
              },
            },
          },
        },
        terminal: true,
        category: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async updateInvoice(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
    updatedBy: string
  ) {
    const invoice = await this.getInvoiceById(id);

    // Check if invoice can be updated
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot update paid invoice');
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        ...updateInvoiceDto,
        updatedAt: new Date(),
      },
      include: {
        outlet: {
          include: {
            merchant: {
              include: {
                user: true,
              },
            },
          },
        },
        terminal: true,
        category: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Log the update
    await this.logInvoiceAction(
      updatedBy,
      'UPDATE',
      'INVOICE',
      id,
      invoice,
      updatedInvoice
    );

    return updatedInvoice;
  }

  async cancelInvoice(id: string, cancelledBy: string) {
    const invoice = await this.getInvoiceById(id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot cancel paid invoice');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Invoice is already cancelled');
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.CANCELLED,
        updatedAt: new Date(),
      },
      include: {
        outlet: {
          include: {
            merchant: {
              include: {
                user: true,
              },
            },
          },
        },
        terminal: true,
        category: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Log the cancellation
    await this.logInvoiceAction(
      cancelledBy,
      'CANCEL',
      'INVOICE',
      id,
      invoice,
      updatedInvoice
    );

    return updatedInvoice;
  }

  async getInvoiceStats(
    outletId?: string,
    merchantId?: string,
    categoryId?: string
  ) {
    const where: any = {};

    if (outletId) {
      where.outletId = outletId;
    }

    if (merchantId) {
      where.outlet = {
        merchantId,
      };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      cancelledInvoices,
      totalAmount,
      paidAmount,
      pendingAmount,
    ] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.count({
        where: { ...where, status: InvoiceStatus.PAID },
      }),
      this.prisma.invoice.count({
        where: { ...where, status: InvoiceStatus.PENDING },
      }),
      this.prisma.invoice.count({
        where: { ...where, status: InvoiceStatus.CANCELLED },
      }),
      this.prisma.invoice.aggregate({
        where,
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: InvoiceStatus.PAID },
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: InvoiceStatus.PENDING },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      cancelledInvoices,
      totalAmount: totalAmount._sum.amount || 0,
      paidAmount: paidAmount._sum.amount || 0,
      pendingAmount: pendingAmount._sum.amount || 0,
      successRate: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0,
    };
  }

  async getInvoiceActivity(invoiceId: string) {
    const invoice = await this.getInvoiceById(invoiceId);

    const activities = await this.prisma.auditLog.findMany({
      where: {
        resource: 'INVOICE',
        resourceId: invoiceId,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      invoice,
      activities,
    };
  }

  private async generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const prefix = `INV-${year}${month}${day}`;

    const lastInvoice = await this.prisma.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: prefix,
        },
      },
      orderBy: { invoiceNumber: 'desc' },
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(
        lastInvoice.invoiceNumber.split('-')[1].slice(8)
      );
      sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  private async logInvoiceAction(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    oldValues: any,
    newValues: any
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
        newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
      },
    });
  }
}
