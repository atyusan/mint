import { Module } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { PayoutsController } from './payouts.controller';
import { PayoutProcessorService } from './payout-processor.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PayoutsController],
  providers: [PayoutsService, PayoutProcessorService],
  exports: [PayoutsService, PayoutProcessorService],
})
export class PayoutsModule {}
