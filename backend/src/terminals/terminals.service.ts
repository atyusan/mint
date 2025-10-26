import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TerminalStatus } from '@prisma/client';
import { CreateTerminalDto, UpdateTerminalDto, AssignTerminalDto } from './dto';

@Injectable()
export class TerminalsService {
  constructor(private prisma: PrismaService) {}

  async createTerminal(
    createTerminalDto: CreateTerminalDto,
    createdBy: string
  ) {
    const { outletId, ...terminalData } = createTerminalDto;

    // Verify outlet exists and user has access
    const outlet = await this.prisma.outlet.findUnique({
      where: { id: outletId },
      include: {
        merchant: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!outlet) {
      throw new NotFoundException('Outlet not found');
    }

    // Check if terminal with this serial number already exists
    const existingTerminal = await this.prisma.terminal.findUnique({
      where: { serialNumber: terminalData.serialNumber },
    });

    if (existingTerminal) {
      throw new BadRequestException(
        'Terminal with this serial number already exists'
      );
    }

    const terminal = await this.prisma.terminal.create({
      data: {
        ...terminalData,
        outletId,
      },
    });

    // Log the creation
    await this.logTerminalAction(
      createdBy,
      'CREATE',
      'TERMINAL',
      terminal.id,
      null,
      terminal
    );

    return this.getTerminalById(terminal.id);
  }

  async getTerminals(
    page: number = 1,
    limit: number = 10,
    outletId?: string,
    status?: TerminalStatus,
    merchantId?: string
  ) {
    // Ensure page and limit are valid numbers
    const validPage = isNaN(page) || page < 1 ? 1 : page;
    const validLimit = isNaN(limit) || limit < 1 ? 10 : limit;
    const skip = (validPage - 1) * validLimit;

    const where: any = {};

    if (outletId) {
      where.outletId = outletId;
    }

    if (status) {
      where.status = status;
    }

    if (merchantId) {
      where.outlet = {
        merchantId,
      };
    }

    const [terminals, total] = await Promise.all([
      this.prisma.terminal.findMany({
        where,
        skip,
        take: validLimit,
        include: {
          outlet: {
            include: {
              merchant: {
                include: {
                  user: true,
                },
              },
            },
          },
          model: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.terminal.count({ where }),
    ]);

    return {
      terminals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getTerminalById(id: string) {
    const terminal = await this.prisma.terminal.findUnique({
      where: { id },
      include: {
        outlet: {
          include: {
            merchant: {
              include: {
                user: true,
              },
            },
          },
        },
        model: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        invoices: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!terminal) {
      throw new NotFoundException('Terminal not found');
    }

    return terminal;
  }

  async updateTerminal(
    id: string,
    updateTerminalDto: UpdateTerminalDto,
    updatedBy: string
  ) {
    const terminal = await this.getTerminalById(id);

    const updatedTerminal = await this.prisma.terminal.update({
      where: { id },
      data: {
        ...updateTerminalDto,
        updatedAt: new Date(),
      },
      include: {
        outlet: {
          include: {
            merchant: {
              include: {
                user: true,
              },
            },
          },
        },
        model: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Log the update
    await this.logTerminalAction(
      updatedBy,
      'UPDATE',
      'TERMINAL',
      id,
      terminal,
      updatedTerminal
    );

    return updatedTerminal;
  }

  async updateTerminalStatus(
    id: string,
    status: TerminalStatus,
    updatedBy: string
  ) {
    const terminal = await this.getTerminalById(id);

    const updatedTerminal = await this.prisma.terminal.update({
      where: { id },
      data: { status },
      include: {
        outlet: {
          include: {
            merchant: {
              include: {
                user: true,
              },
            },
          },
        },
        model: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Log the status change
    await this.logTerminalAction(
      updatedBy,
      'UPDATE_STATUS',
      'TERMINAL',
      id,
      terminal,
      updatedTerminal
    );

    return updatedTerminal;
  }

  async assignTerminal(
    terminalId: string,
    assignTerminalDto: AssignTerminalDto,
    assignedBy: string
  ) {
    const { outletId } = assignTerminalDto;

    const terminal = await this.getTerminalById(terminalId);
    const outlet = await this.prisma.outlet.findUnique({
      where: { id: outletId },
      include: {
        merchant: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!outlet) {
      throw new NotFoundException('Outlet not found');
    }

    const updatedTerminal = await this.prisma.terminal.update({
      where: { id: terminalId },
      data: { outletId },
      include: {
        outlet: {
          include: {
            merchant: {
              include: {
                user: true,
              },
            },
          },
        },
        model: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Log the assignment
    await this.logTerminalAction(
      assignedBy,
      'ASSIGN',
      'TERMINAL',
      terminalId,
      terminal,
      updatedTerminal
    );

    return updatedTerminal;
  }

  async updateTerminalMetadata(id: string, metadata: any, updatedBy: string) {
    const terminal = await this.getTerminalById(id);

    const updatedTerminal = await this.prisma.terminal.update({
      where: { id },
      data: { metadata },
      include: {
        outlet: {
          include: {
            merchant: {
              include: {
                user: true,
              },
            },
          },
        },
        model: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Log the metadata update
    await this.logTerminalAction(
      updatedBy,
      'UPDATE_METADATA',
      'TERMINAL',
      id,
      terminal,
      updatedTerminal
    );

    return updatedTerminal;
  }

  async getTerminalStats(terminalId: string) {
    const terminal = await this.getTerminalById(terminalId);

    const [
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      totalAmount,
      paidAmount,
    ] = await Promise.all([
      this.prisma.invoice.count({
        where: { terminalId },
      }),
      this.prisma.invoice.count({
        where: { terminalId, status: 'PAID' },
      }),
      this.prisma.invoice.count({
        where: { terminalId, status: 'PENDING' },
      }),
      this.prisma.invoice.aggregate({
        where: { terminalId },
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { terminalId, status: 'PAID' },
        _sum: { amount: true },
      }),
    ]);

    return {
      terminal,
      stats: {
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        totalAmount: totalAmount._sum.amount || 0,
        paidAmount: paidAmount._sum.amount || 0,
        successRate:
          totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0,
      },
    };
  }

  async getTerminalActivity(terminalId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await this.prisma.invoice.findMany({
      where: {
        terminalId,
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return activities;
  }

  async deleteTerminal(id: string, deletedBy: string) {
    const terminal = await this.getTerminalById(id);

    // Check if terminal has any active invoices
    const activeInvoices = await this.prisma.invoice.count({
      where: {
        terminalId: id,
        status: {
          in: ['PENDING', 'PARTIALLY_PAID'],
        },
      },
    });

    if (activeInvoices > 0) {
      throw new BadRequestException(
        'Cannot delete terminal with active invoices. Please cancel or complete all invoices first.'
      );
    }

    await this.prisma.terminal.delete({
      where: { id },
    });

    // Log the deletion
    await this.logTerminalAction(
      deletedBy,
      'DELETE',
      'TERMINAL',
      id,
      terminal,
      null
    );

    return { message: 'Terminal deleted successfully' };
  }

  private async logTerminalAction(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    oldValues: any,
    newValues: any
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
        newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
      },
    });
  }
}
