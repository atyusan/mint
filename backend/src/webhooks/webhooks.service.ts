import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private prisma: PrismaService) {}

  async handleChargeSuccess(data: any) {
    this.logger.log(`Processing charge success: ${data.reference}`);

    try {
      // Find the Paystack invoice by reference
      const paystackInvoice = await this.prisma.paystackInvoice.findFirst({
        where: {
          requestCode: data.reference,
        },
      });

      if (!paystackInvoice) {
        this.logger.warn(
          `No Paystack invoice found for reference: ${data.reference}`
        );
        return;
      }

      // Update invoice status
      await this.prisma.invoice.update({
        where: { id: paystackInvoice.invoiceId },
        data: {
          status: InvoiceStatus.PAID,
          paidAt: new Date(),
        },
      });

      // Create payment record
      await this.prisma.payment.create({
        data: {
          invoiceId: paystackInvoice.invoiceId,
          amount: paystackInvoice.amount,
          fee: 0, // Fee already included in invoice
          netAmount: paystackInvoice.amount,
          currency: paystackInvoice.currency,
          method: PaymentMethod.CARD,
          reference: data.reference,
          paystackReference: data.reference,
          status: 'Success',
          processedAt: new Date(),
          metadata: {
            paystackData: data,
          },
        },
      });

      // Update Paystack invoice status
      await this.prisma.paystackInvoice.update({
        where: { id: paystackInvoice.id },
        data: {
          status: 'success',
        },
      });

      this.logger.log(
        `Successfully processed charge success for invoice: ${paystackInvoice.invoiceId}`
      );
    } catch (error) {
      this.logger.error('Error processing charge success:', error);
      throw error;
    }
  }

  async handlePaymentRequestSuccess(data: any) {
    this.logger.log(`Processing payment request success: ${data.request_code}`);

    try {
      // Find the Paystack invoice
      const paystackInvoice = await this.prisma.paystackInvoice.findFirst({
        where: {
          requestCode: data.request_code,
        },
      });

      if (!paystackInvoice) {
        this.logger.warn(
          `No Paystack invoice found for request code: ${data.request_code}`
        );
        return;
      }

      // Update invoice status
      await this.prisma.invoice.update({
        where: { id: paystackInvoice.invoiceId },
        data: {
          status: InvoiceStatus.PAID,
          paidAt: new Date(),
        },
      });

      // Create payment record
      await this.prisma.payment.create({
        data: {
          invoiceId: paystackInvoice.invoiceId,
          amount: paystackInvoice.amount,
          fee: 0, // Fee already included in invoice
          netAmount: paystackInvoice.amount,
          currency: paystackInvoice.currency,
          method: PaymentMethod.CARD,
          reference: data.request_code,
          paystackReference: data.reference,
          status: 'Success',
          processedAt: new Date(),
          metadata: {
            paystackData: data,
          },
        },
      });

      // Update Paystack invoice status
      await this.prisma.paystackInvoice.update({
        where: { id: paystackInvoice.id },
        data: {
          status: 'success',
        },
      });

      this.logger.log(
        `Successfully processed payment request success for invoice: ${paystackInvoice.invoiceId}`
      );
    } catch (error) {
      this.logger.error('Error processing payment request success:', error);
      throw error;
    }
  }

  async handlePaymentRequestPending(data: any) {
    this.logger.log(`Processing payment request pending: ${data.request_code}`);

    try {
      // Find the Paystack invoice
      const paystackInvoice = await this.prisma.paystackInvoice.findFirst({
        where: {
          requestCode: data.request_code,
        },
      });

      if (!paystackInvoice) {
        this.logger.warn(
          `No Paystack invoice found for request code: ${data.request_code}`
        );
        return;
      }

      // Update Paystack invoice status
      await this.prisma.paystackInvoice.update({
        where: { id: paystackInvoice.id },
        data: {
          status: 'pending',
        },
      });

      this.logger.log(
        `Successfully processed payment request pending for invoice: ${paystackInvoice.invoiceId}`
      );
    } catch (error) {
      this.logger.error('Error processing payment request pending:', error);
      throw error;
    }
  }

  async handleInvoicePaymentFailed(data: any) {
    this.logger.log(`Processing invoice payment failed: ${data.reference}`);

    try {
      // Find the payment by reference
      const payment = await this.prisma.payment.findUnique({
        where: { reference: data.reference },
      });

      if (!payment) {
        this.logger.warn(`No payment found for reference: ${data.reference}`);
        return;
      }

      // Update payment status
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'Failed',
          metadata: {
            failureReason: data.reason,
            paystackData: data,
          },
        },
      });

      this.logger.log(
        `Successfully processed payment failure for payment: ${payment.id}`
      );
    } catch (error) {
      this.logger.error('Error processing invoice payment failed:', error);
      throw error;
    }
  }

  async handleTerminalStatusUpdate(data: any) {
    this.logger.log(`Processing terminal status update: ${data.terminal_id}`);

    try {
      // Find the terminal by Paystack terminal ID
      const terminal = await this.prisma.terminal.findFirst({
        where: {
          serialNumber: data.terminal_id,
        },
      });

      if (!terminal) {
        this.logger.warn(
          `No terminal found for Paystack ID: ${data.terminal_id}`
        );
        return;
      }

      // Update terminal status and metadata
      await this.prisma.terminal.update({
        where: { id: terminal.id },
        data: {
          status: this.mapPaystackStatusToLocal(data.status) as any,
          isOnline: data.status === 'online',
          lastSeenAt: new Date(),
          metadata: {
            paystackStatus: data.status,
            lastUpdate: new Date(),
          },
        },
      });

      this.logger.log(`Successfully updated terminal status: ${terminal.id}`);
    } catch (error) {
      this.logger.error('Error processing terminal status update:', error);
      throw error;
    }
  }

  async handleTerminalEvent(data: any) {
    this.logger.log(`Processing terminal event: ${data.event_type}`);

    try {
      // Find the terminal by Paystack terminal ID
      const terminal = await this.prisma.terminal.findFirst({
        where: {
          serialNumber: data.terminal_id,
        },
      });

      if (!terminal) {
        this.logger.warn(
          `No terminal found for Paystack ID: ${data.terminal_id}`
        );
        return;
      }

      // Log the terminal event
      await this.prisma.auditLog.create({
        data: {
          action: 'TERMINAL_EVENT',
          resource: 'TERMINAL',
          resourceId: terminal.id,
          newValues: {
            eventType: data.event_type,
            eventData: data,
            timestamp: new Date(),
          },
        },
      });

      this.logger.log(`Successfully logged terminal event: ${data.event_type}`);
    } catch (error) {
      this.logger.error('Error processing terminal event:', error);
      throw error;
    }
  }

  private mapPaystackStatusToLocal(paystackStatus: string): string {
    const statusMap = {
      online: 'ACTIVE',
      offline: 'INACTIVE',
      maintenance: 'MAINTENANCE',
      error: 'INACTIVE',
    };

    return statusMap[paystackStatus] || 'INACTIVE';
  }
}
