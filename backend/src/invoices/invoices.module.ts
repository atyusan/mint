import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PaystackModule } from '../paystack/paystack.module';
import { FeesModule } from '../fees/fees.module';

@Module({
  imports: [PrismaModule, PaystackModule, FeesModule],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
