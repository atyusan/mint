import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateOutletDto,
  UpdateOutletDto,
  OutletSearchDto,
} from './dto/outlet.dto';

@Injectable()
export class OutletsService {
  constructor(private prisma: PrismaService) {}

  async createOutlet(createOutletDto: CreateOutletDto) {
    const { merchantId, ...outletData } = createOutletDto;

    // Check if merchant exists
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Create outlet
    const outlet = await this.prisma.outlet.create({
      data: {
        ...outletData,
        merchantId,
      },
      include: {
        merchant: {
          include: {
            user: true,
          },
        },
        terminals: true,
      },
    });

    return outlet;
  }

  async getOutlets(
    page: number = 1,
    limit: number = 10,
    search?: string,
    city?: string,
    state?: string,
    merchantId?: string,
    isActive?: string
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (state) {
      where.state = { contains: state, mode: 'insensitive' };
    }

    if (merchantId) {
      where.merchantId = merchantId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [outlets, total] = await Promise.all([
      this.prisma.outlet.findMany({
        where,
        skip,
        take: limit,
        include: {
          merchant: {
            include: {
              user: true,
            },
          },
          terminals: {
            select: {
              id: true,
              serialNumber: true,
              model: true,
              status: true,
              isOnline: true,
              location: true,
            },
          },
          _count: {
            select: {
              terminals: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.outlet.count({ where }),
    ]);

    return {
      outlets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOutletById(id: string) {
    const outlet = await this.prisma.outlet.findUnique({
      where: { id },
      include: {
        merchant: {
          include: {
            user: true,
          },
        },
        terminals: {
          select: {
            id: true,
            serialNumber: true,
            model: true,
            status: true,
            isOnline: true,
            location: true,
            lastSeenAt: true,
            batteryLevel: true,
          },
        },
        _count: {
          select: {
            terminals: true,
          },
        },
      },
    });

    if (!outlet) {
      throw new NotFoundException('Outlet not found');
    }

    return outlet;
  }

  async updateOutlet(id: string, updateOutletDto: UpdateOutletDto) {
    // Check if outlet exists
    const existingOutlet = await this.prisma.outlet.findUnique({
      where: { id },
    });

    if (!existingOutlet) {
      throw new NotFoundException('Outlet not found');
    }

    // Update outlet
    const outlet = await this.prisma.outlet.update({
      where: { id },
      data: updateOutletDto,
      include: {
        merchant: {
          include: {
            user: true,
          },
        },
        terminals: {
          select: {
            id: true,
            serialNumber: true,
            model: true,
            status: true,
            isOnline: true,
            location: true,
          },
        },
        _count: {
          select: {
            terminals: true,
          },
        },
      },
    });

    return outlet;
  }

  async deleteOutlet(id: string) {
    // Check if outlet exists
    const existingOutlet = await this.prisma.outlet.findUnique({
      where: { id },
      include: {
        terminals: true,
      },
    });

    if (!existingOutlet) {
      throw new NotFoundException('Outlet not found');
    }

    // Check if outlet has terminals
    if (existingOutlet.terminals.length > 0) {
      throw new BadRequestException(
        'Cannot delete outlet with active terminals. Please remove terminals first.'
      );
    }

    // Delete outlet
    await this.prisma.outlet.delete({
      where: { id },
    });

    return { message: 'Outlet deleted successfully' };
  }

  async getMerchantOutlets(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const outlets = await this.prisma.outlet.findMany({
      where: { merchantId },
      include: {
        terminals: {
          select: {
            id: true,
            serialNumber: true,
            model: true,
            status: true,
            isOnline: true,
            location: true,
          },
        },
        _count: {
          select: {
            terminals: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return outlets;
  }

  async getOutletStats(id: string) {
    const outlet = await this.prisma.outlet.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            terminals: true,
          },
        },
      },
    });

    if (!outlet) {
      throw new NotFoundException('Outlet not found');
    }

    // Get terminal statistics
    const terminalStats = await this.prisma.terminal.groupBy({
      by: ['status', 'isOnline'],
      where: { outletId: id },
      _count: {
        id: true,
      },
    });

    const stats = {
      totalTerminals: outlet._count.terminals,
      activeTerminals: terminalStats
        .filter((stat) => stat.status === 'ACTIVE')
        .reduce((sum, stat) => sum + stat._count.id, 0),
      onlineTerminals: terminalStats
        .filter((stat) => stat.isOnline === true)
        .reduce((sum, stat) => sum + stat._count.id, 0),
      offlineTerminals: terminalStats
        .filter((stat) => stat.isOnline === false)
        .reduce((sum, stat) => sum + stat._count.id, 0),
    };

    return stats;
  }
}
