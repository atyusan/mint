import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  BulkImportDto,
  InventoryStatus,
} from './dto/inventory.dto';

@Injectable()
export class TerminalInventoryService {
  constructor(private prisma: PrismaService) {}

  async createInventoryItem(createInventoryItemDto: CreateInventoryItemDto) {
    // Check if serial number already exists
    const existing = await this.prisma.terminalInventory.findUnique({
      where: { serialNumber: createInventoryItemDto.serialNumber },
    });

    if (existing) {
      throw new BadRequestException(
        `Terminal with serial number ${createInventoryItemDto.serialNumber} already exists`
      );
    }

    const inventoryItem = await this.prisma.terminalInventory.create({
      data: {
        ...createInventoryItemDto,
        receivedDate: createInventoryItemDto.receivedDate || new Date(),
        status: InventoryStatus.IN_STOCK,
      },
    });

    return inventoryItem;
  }

  async bulkImportInventory(bulkImportDto: BulkImportDto) {
    const { serialNumbers, ...commonData } = bulkImportDto;

    // Check for duplicate serial numbers
    const duplicates = await this.prisma.terminalInventory.findMany({
      where: {
        serialNumber: { in: serialNumbers },
      },
    });

    if (duplicates.length > 0) {
      throw new BadRequestException(
        `Duplicate serial numbers found: ${duplicates.map((d) => d.serialNumber).join(', ')}`
      );
    }

    // Create inventory items
    const inventoryItems = await Promise.all(
      serialNumbers.map((serialNumber) =>
        this.prisma.terminalInventory.create({
          data: {
            serialNumber,
            ...commonData,
            receivedDate: commonData.receivedDate || new Date(),
            status: InventoryStatus.IN_STOCK,
          },
        })
      )
    );

    return {
      created: inventoryItems.length,
      items: inventoryItems,
    };
  }

  async getInventory(
    page: number = 1,
    limit: number = 10,
    modelId?: string,
    status?: InventoryStatus,
    serialNumber?: string
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (modelId) {
      where.modelId = modelId;
    }

    if (status) {
      where.status = status;
    }

    if (serialNumber) {
      where.serialNumber = { contains: serialNumber, mode: 'insensitive' };
    }

    const [inventory, total] = await Promise.all([
      this.prisma.terminalInventory.findMany({
        where,
        skip,
        take: limit,
        include: {
          model: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.terminalInventory.count({ where }),
    ]);

    return {
      data: inventory,
      total,
      page,
      limit,
    };
  }

  async getInventoryById(id: string) {
    const inventoryItem = await this.prisma.terminalInventory.findUnique({
      where: { id },
      include: {
        terminalRequests: {
          include: {
            terminalRequest: {
              include: {
                outlet: {
                  select: {
                    name: true,
                  },
                },
                merchant: {
                  select: {
                    businessName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!inventoryItem) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    return inventoryItem;
  }

  async updateInventoryItem(id: string, updateDto: UpdateInventoryItemDto) {
    const existingItem = await this.prisma.terminalInventory.findUnique({
      where: { id },
    });

    if (!existingItem) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    // Explicitly exclude serialNumber and model from updates
    const { serialNumber, model, ...updateData } = updateDto as any;

    if (serialNumber || model) {
      throw new BadRequestException(
        'Cannot update serial number or model. These fields are immutable.'
      );
    }

    const updatedItem = await this.prisma.terminalInventory.update({
      where: { id },
      data: updateData,
    });

    return updatedItem;
  }

  async deleteInventoryItem(id: string) {
    const existingItem = await this.prisma.terminalInventory.findUnique({
      where: { id },
      include: {
        terminalRequests: true,
      },
    });

    if (!existingItem) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    if (existingItem.terminalRequests.length > 0) {
      throw new BadRequestException(
        'Cannot delete inventory item that has been allocated'
      );
    }

    await this.prisma.terminalInventory.delete({
      where: { id },
    });

    return { message: 'Inventory item deleted successfully' };
  }

  async getStockCounts() {
    const counts = await this.prisma.terminalInventory.groupBy({
      by: ['modelId', 'status'],
      _count: {
        id: true,
      },
    });

    // Transform to a more readable format
    const summary: Record<string, Record<string, number>> = {};

    for (const item of counts) {
      if (!summary[item.modelId]) {
        summary[item.modelId] = {};
      }
      summary[item.modelId][item.status] = item._count.id;
    }

    return summary;
  }

  async getAvailableCount(modelId: string): Promise<number> {
    const count = await this.prisma.terminalInventory.count({
      where: {
        modelId: modelId,
        status: InventoryStatus.IN_STOCK,
      },
    });

    return count;
  }
}
