import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTerminalModelDto } from './dto/create-terminal-model.dto';
import { UpdateTerminalModelDto } from './dto/update-terminal-model.dto';

@Injectable()
export class TerminalModelsService {
  constructor(private prisma: PrismaService) {}

  async create(createTerminalModelDto: CreateTerminalModelDto) {
    // Check if model name already exists
    const existing = await this.prisma.terminalModel.findUnique({
      where: { name: createTerminalModelDto.name },
    });

    if (existing) {
      throw new BadRequestException(
        `Terminal model with name "${createTerminalModelDto.name}" already exists`
      );
    }

    // Check if code exists (if provided)
    if (createTerminalModelDto.code) {
      const existingCode = await this.prisma.terminalModel.findUnique({
        where: { code: createTerminalModelDto.code },
      });

      if (existingCode) {
        throw new BadRequestException(
          `Terminal model with code "${createTerminalModelDto.code}" already exists`
        );
      }
    }

    return this.prisma.terminalModel.create({
      data: {
        ...createTerminalModelDto,
        isActive: createTerminalModelDto.isActive ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.terminalModel.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            inventory: true,
            terminals: true,
            requests: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const model = await this.prisma.terminalModel.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            inventory: true,
            terminals: true,
            requests: true,
          },
        },
      },
    });

    if (!model) {
      throw new NotFoundException(`Terminal model with ID ${id} not found`);
    }

    return model;
  }

  async update(id: string, updateTerminalModelDto: UpdateTerminalModelDto) {
    const model = await this.prisma.terminalModel.findUnique({
      where: { id },
    });

    if (!model) {
      throw new NotFoundException(`Terminal model with ID ${id} not found`);
    }

    // Check for duplicate name
    if (
      updateTerminalModelDto.name &&
      updateTerminalModelDto.name !== model.name
    ) {
      const existing = await this.prisma.terminalModel.findUnique({
        where: { name: updateTerminalModelDto.name },
      });

      if (existing) {
        throw new BadRequestException(
          `Terminal model with name "${updateTerminalModelDto.name}" already exists`
        );
      }
    }

    // Check for duplicate code
    if (
      updateTerminalModelDto.code &&
      updateTerminalModelDto.code !== model.code
    ) {
      const existingCode = await this.prisma.terminalModel.findUnique({
        where: { code: updateTerminalModelDto.code },
      });

      if (existingCode) {
        throw new BadRequestException(
          `Terminal model with code "${updateTerminalModelDto.code}" already exists`
        );
      }
    }

    return this.prisma.terminalModel.update({
      where: { id },
      data: updateTerminalModelDto,
    });
  }

  async remove(id: string) {
    const model = await this.prisma.terminalModel.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            inventory: true,
            terminals: true,
            requests: true,
          },
        },
      },
    });

    if (!model) {
      throw new NotFoundException(`Terminal model with ID ${id} not found`);
    }

    // Check if model is in use
    if (
      model._count.inventory > 0 ||
      model._count.terminals > 0 ||
      model._count.requests > 0
    ) {
      throw new BadRequestException(
        `Cannot delete terminal model. It is being used by ${model._count.inventory + model._count.terminals + model._count.requests} records`
      );
    }

    return this.prisma.terminalModel.delete({
      where: { id },
    });
  }
}
