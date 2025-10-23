import {
  Controller,
  Post,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('paystack')
export class PaystackController {
  private readonly logger = new Logger(PaystackController.name);

  constructor(
    private readonly paystackService: PaystackService,
    private readonly webhooksService: WebhooksService,
  ) {}

  @Public()
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-paystack-signature') signature: string,
  ) {
    if (!signature) {
      this.logger.error('Missing Paystack signature');
      throw new BadRequestException('Missing signature');
    }

    const payload = req.rawBody?.toString() || '';
    const isValid = await this.paystackService.verifyWebhookSignature(payload, signature);

    if (!isValid) {
      this.logger.error('Invalid Paystack signature');
      throw new BadRequestException('Invalid signature');
    }

    const event = JSON.parse(payload);
    this.logger.log(`Received Paystack webhook: ${event.event}`);

    try {
      await this.processWebhookEvent(event);
      return { status: 'success' };
    } catch (error) {
      this.logger.error('Error processing webhook:', error);
      throw new BadRequestException('Failed to process webhook');
    }
  }

  private async processWebhookEvent(event: any) {
    const { event: eventType, data } = event;

    switch (eventType) {
      case 'charge.success':
        await this.handleChargeSuccess(data);
        break;
      case 'paymentrequest.success':
        await this.handlePaymentRequestSuccess(data);
        break;
      case 'paymentrequest.pending':
        await this.handlePaymentRequestPending(data);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(data);
        break;
      case 'terminal.status':
        await this.handleTerminalStatusUpdate(data);
        break;
      case 'terminal.event':
        await this.handleTerminalEvent(data);
        break;
      default:
        this.logger.log(`Unhandled event type: ${eventType}`);
    }
  }

  private async handleChargeSuccess(data: any) {
    await this.webhooksService.handleChargeSuccess(data);
  }

  private async handlePaymentRequestSuccess(data: any) {
    await this.webhooksService.handlePaymentRequestSuccess(data);
  }

  private async handlePaymentRequestPending(data: any) {
    await this.webhooksService.handlePaymentRequestPending(data);
  }

  private async handleInvoicePaymentFailed(data: any) {
    await this.webhooksService.handleInvoicePaymentFailed(data);
  }

  private async handleTerminalStatusUpdate(data: any) {
    await this.webhooksService.handleTerminalStatusUpdate(data);
  }

  private async handleTerminalEvent(data: any) {
    await this.webhooksService.handleTerminalEvent(data);
  }
}
