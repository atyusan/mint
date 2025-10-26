import { Module } from '@nestjs/common';
import { TerminalRequestsService } from './terminal-requests.service';
import { TerminalRequestsController } from './terminal-requests.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TerminalRequestsService],
  controllers: [TerminalRequestsController],
  exports: [TerminalRequestsService],
})
export class TerminalRequestsModule {}
