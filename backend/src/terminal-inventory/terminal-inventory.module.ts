import { Module } from '@nestjs/common';
import { TerminalInventoryService } from './terminal-inventory.service';
import { TerminalInventoryController } from './terminal-inventory.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TerminalInventoryService],
  controllers: [TerminalInventoryController],
  exports: [TerminalInventoryService],
})
export class TerminalInventoryModule {}
