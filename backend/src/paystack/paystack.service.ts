import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey: string;
  private readonly publicKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    this.publicKey = this.configService.get<string>('PAYSTACK_PUBLIC_KEY');

    if (!this.secretKey || !this.publicKey) {
      throw new Error('Paystack API keys are not configured');
    }
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async createCustomer(customerData: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    metadata?: any;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/customer`,
        customerData,
        { headers: this.getHeaders() }
      );

      this.logger.log(`Customer created: ${response.data.data.customer_code}`);
      return response.data.data;
    } catch (error) {
      this.logger.error('Error creating customer:', error.response?.data || error.message);
      throw new BadRequestException('Failed to create Paystack customer');
    }
  }

  async getCustomer(customerCode: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/customer/${customerCode}`,
        { headers: this.getHeaders() }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Error fetching customer:', error.response?.data || error.message);
      throw new BadRequestException('Failed to fetch Paystack customer');
    }
  }

  async createPaymentRequest(paymentRequestData: {
    customer: string;
    amount: number;
    description?: string;
    line_items?: Array<{
      name: string;
      amount: number;
      quantity: number;
    }>;
    due_date?: string;
    metadata?: any;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/paymentrequest`,
        paymentRequestData,
        { headers: this.getHeaders() }
      );

      this.logger.log(`Payment request created: ${response.data.data.request_code}`);
      return response.data.data;
    } catch (error) {
      this.logger.error('Error creating payment request:', error.response?.data || error.message);
      throw new BadRequestException('Failed to create Paystack payment request');
    }
  }

  async getPaymentRequest(requestCode: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/paymentrequest/${requestCode}`,
        { headers: this.getHeaders() }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Error fetching payment request:', error.response?.data || error.message);
      throw new BadRequestException('Failed to fetch Paystack payment request');
    }
  }

  async listPaymentRequests(params?: {
    customer?: string;
    status?: string;
    from?: string;
    to?: string;
    perPage?: number;
    page?: number;
  }) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/paymentrequest`,
        {
          headers: this.getHeaders(),
          params,
        }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Error listing payment requests:', error.response?.data || error.message);
      throw new BadRequestException('Failed to list Paystack payment requests');
    }
  }

  async verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  async getTransaction(transactionId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/${transactionId}`,
        { headers: this.getHeaders() }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Error fetching transaction:', error.response?.data || error.message);
      throw new BadRequestException('Failed to fetch Paystack transaction');
    }
  }

  async listTransactions(params?: {
    customer?: string;
    status?: string;
    from?: string;
    to?: string;
    perPage?: number;
    page?: number;
  }) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction`,
        {
          headers: this.getHeaders(),
          params,
        }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Error listing transactions:', error.response?.data || error.message);
      throw new BadRequestException('Failed to list Paystack transactions');
    }
  }

  async initializeTransaction(transactionData: {
    email: string;
    amount: number;
    reference?: string;
    callback_url?: string;
    metadata?: any;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        transactionData,
        { headers: this.getHeaders() }
      );

      this.logger.log(`Transaction initialized: ${response.data.data.reference}`);
      return response.data.data;
    } catch (error) {
      this.logger.error('Error initializing transaction:', error.response?.data || error.message);
      throw new BadRequestException('Failed to initialize Paystack transaction');
    }
  }

  async verifyTransaction(reference: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        { headers: this.getHeaders() }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Error verifying transaction:', error.response?.data || error.message);
      throw new BadRequestException('Failed to verify Paystack transaction');
    }
  }

  // ===== TERMINAL MANAGEMENT =====

  async createTerminal(terminalData: {
    name: string;
    type: string;
    serial_number: string;
    metadata?: any;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/terminal`,
        terminalData,
        { headers: this.getHeaders() }
      );

      this.logger.log(`Terminal created: ${response.data.data.serial_number}`);
      return response.data.data;
    } catch (error) {
      this.logger.error('Error creating terminal:', error.response?.data || error.message);
      throw new BadRequestException('Failed to create Paystack terminal');
    }
  }

  async getTerminal(terminalId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/terminal/${terminalId}`,
        { headers: this.getHeaders() }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Error fetching terminal:', error.response?.data || error.message);
      throw new BadRequestException('Failed to fetch Paystack terminal');
    }
  }

  async listTerminals(params?: {
    perPage?: number;
    page?: number;
    status?: string;
  }) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/terminal`,
        {
          headers: this.getHeaders(),
          params,
        }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Error listing terminals:', error.response?.data || error.message);
      throw new BadRequestException('Failed to list Paystack terminals');
    }
  }

  async updateTerminal(terminalId: string, updateData: {
    name?: string;
    metadata?: any;
  }) {
    try {
      const response = await axios.put(
        `${this.baseUrl}/terminal/${terminalId}`,
        updateData,
        { headers: this.getHeaders() }
      );

      this.logger.log(`Terminal updated: ${terminalId}`);
      return response.data.data;
    } catch (error) {
      this.logger.error('Error updating terminal:', error.response?.data || error.message);
      throw new BadRequestException('Failed to update Paystack terminal');
    }
  }

  async sendEvent(terminalId: string, eventData: {
    type: string;
    action: string;
    data?: any;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/terminal/${terminalId}/event`,
        eventData,
        { headers: this.getHeaders() }
      );

      this.logger.log(`Event sent to terminal ${terminalId}: ${eventData.action}`);
      return response.data.data;
    } catch (error) {
      this.logger.error('Error sending terminal event:', error.response?.data || error.message);
      throw new BadRequestException('Failed to send terminal event');
    }
  }

  async getTerminalStatus(terminalId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/terminal/${terminalId}/status`,
        { headers: this.getHeaders() }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Error fetching terminal status:', error.response?.data || error.message);
      throw new BadRequestException('Failed to fetch terminal status');
    }
  }

  // ===== ENHANCED INVOICE MANAGEMENT =====

  async createInvoiceWithTerminal(invoiceData: {
    customer: string;
    amount: number;
    description?: string;
    line_items?: Array<{
      name: string;
      amount: number;
      quantity: number;
    }>;
    due_date?: string;
    metadata?: any;
    terminal?: string;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/paymentrequest`,
        invoiceData,
        { headers: this.getHeaders() }
      );

      this.logger.log(`Invoice with terminal created: ${response.data.data.request_code}`);
      return response.data.data;
    } catch (error) {
      this.logger.error('Error creating invoice with terminal:', error.response?.data || error.message);
      throw new BadRequestException('Failed to create Paystack invoice with terminal');
    }
  }

  async sendInvoiceToTerminal(terminalId: string, requestCode: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/terminal/${terminalId}/invoice`,
        { request_code: requestCode },
        { headers: this.getHeaders() }
      );

      this.logger.log(`Invoice sent to terminal ${terminalId}: ${requestCode}`);
      return response.data.data;
    } catch (error) {
      this.logger.error('Error sending invoice to terminal:', error.response?.data || error.message);
      throw new BadRequestException('Failed to send invoice to terminal');
    }
  }

  // ===== FEE CALCULATION =====

  calculateDynamicFee(amount: number, merchantTier: string = 'standard'): number {
    const feeStructures = {
      basic: { percentage: 0.035, min: 50, max: 5000 }, // 3.5%
      standard: { percentage: 0.025, min: 50, max: 2000 }, // 2.5%
      premium: { percentage: 0.015, min: 50, max: 1000 }, // 1.5%
      enterprise: { percentage: 0.01, min: 50, max: 500 }, // 1%
    };

    const structure = feeStructures[merchantTier] || feeStructures.standard;
    const calculatedFee = amount * structure.percentage;
    
    return Math.max(structure.min, Math.min(calculatedFee, structure.max));
  }

  // ===== WEBHOOK ENHANCEMENT =====

  async processWebhookEvent(event: string, data: any) {
    this.logger.log(`Processing webhook event: ${event}`);

    switch (event) {
      case 'charge.success':
        return this.handleChargeSuccess(data);
      case 'paymentrequest.success':
        return this.handlePaymentRequestSuccess(data);
      case 'paymentrequest.pending':
        return this.handlePaymentRequestPending(data);
      case 'invoice.payment_failed':
        return this.handleInvoicePaymentFailed(data);
      case 'terminal.status':
        return this.handleTerminalStatusUpdate(data);
      default:
        this.logger.warn(`Unhandled webhook event: ${event}`);
        return null;
    }
  }

  private async handleChargeSuccess(data: any) {
    this.logger.log(`Processing charge success: ${data.reference}`);
    // Implementation handled by WebhooksService
    return { event: 'charge.success', processed: true };
  }

  private async handlePaymentRequestSuccess(data: any) {
    this.logger.log(`Processing payment request success: ${data.request_code}`);
    // Implementation handled by WebhooksService
    return { event: 'paymentrequest.success', processed: true };
  }

  private async handlePaymentRequestPending(data: any) {
    this.logger.log(`Processing payment request pending: ${data.request_code}`);
    // Implementation handled by WebhooksService
    return { event: 'paymentrequest.pending', processed: true };
  }

  private async handleInvoicePaymentFailed(data: any) {
    this.logger.log(`Processing invoice payment failed: ${data.reference}`);
    // Implementation handled by WebhooksService
    return { event: 'invoice.payment_failed', processed: true };
  }

  private async handleTerminalStatusUpdate(data: any) {
    this.logger.log(`Processing terminal status update: ${data.terminal_id}`);
    // Handle terminal status updates
    return { event: 'terminal.status', processed: true };
  }
}
