import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TerminalsModule } from './terminals/terminals.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaystackModule } from './paystack/paystack.module';
import { PayoutsModule } from './payouts/payouts.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { FeesModule } from './fees/fees.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    TerminalsModule,
    InvoicesModule,
    PaystackModule,
    PayoutsModule,
    AnalyticsModule,
    FeesModule,
    WebhooksModule,
  ],
})
export class AppModule {}
