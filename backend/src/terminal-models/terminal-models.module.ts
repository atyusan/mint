import { Module } from '@nestjs/common';
import { TerminalModelsService } from './terminal-models.service';
import { TerminalModelsController } from './terminal-models.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TerminalModelsController],
  providers: [TerminalModelsService],
  exports: [TerminalModelsService],
})
export class TerminalModelsModule {}
