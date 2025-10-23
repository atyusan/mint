import { Module } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { PaystackController } from './paystack.controller';
import { WebhooksService } from '../webhooks/webhooks.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [PaystackService, WebhooksService],
  controllers: [PaystackController],
  exports: [PaystackService, WebhooksService],
})
export class PaystackModule {}
