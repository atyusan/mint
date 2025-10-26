import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTerminalRequestDto,
  UpdateTerminalRequestDto,
  TerminalRequestStatus,
} from './dto/terminal-request.dto';

@Injectable()
export class TerminalRequestsService {
  constructor(private prisma: PrismaService) {}

  async createTerminalRequest(
    createTerminalRequestDto: CreateTerminalRequestDto,
    requestedBy: string
  ) {
    const { outletId, merchantId, quantity, modelId, location, notes } =
      createTerminalRequestDto;

    // Verify outlet exists
    const outlet = await this.prisma.outlet.findUnique({
      where: { id: outletId },
    });

    if (!outlet) {
      throw new NotFoundException('Outlet not found');
    }

    // Verify merchant exists and outlet belongs to merchant
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    if (outlet.merchantId !== merchantId) {
      throw new BadRequestException(
        'Outlet does not belong to the specified merchant'
      );
    }

    // Create terminal request
    const terminalRequest = await this.prisma.terminalRequest.create({
      data: {
        outletId,
        merchantId,
        requestedBy,
        quantity,
        modelId,
        location,
        notes,
        status: TerminalRequestStatus.PENDING,
      },
      include: {
        outlet: {
          select: {
            name: true,
            address: true,
          },
        },
        merchant: {
          select: {
            businessName: true,
          },
        },
      },
    });

    return terminalRequest;
  }

  async getTerminalRequests(
    page: number = 1,
    limit: number = 10,
    outletId?: string,
    merchantId?: string,
    status?: TerminalRequestStatus
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (outletId) {
      where.outletId = outletId;
    }

    if (merchantId) {
      where.merchantId = merchantId;
    }

    if (status) {
      where.status = status;
    }

    const [terminalRequests, total] = await Promise.all([
      this.prisma.terminalRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          outlet: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          merchant: {
            select: {
              id: true,
              businessName: true,
            },
          },
          model: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          terminals: {
            select: {
              id: true,
              serialNumber: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.terminalRequest.count({ where }),
    ]);

    return {
      terminalRequests,
      total,
      page,
      limit,
    };
  }

  async getTerminalRequestById(id: string) {
    const terminalRequest = await this.prisma.terminalRequest.findUnique({
      where: { id },
      include: {
        outlet: true,
        merchant: true,
        terminals: true,
      },
    });

    if (!terminalRequest) {
      throw new NotFoundException(`Terminal request with ID ${id} not found`);
    }

    return terminalRequest;
  }

  async updateTerminalRequest(
    id: string,
    updateTerminalRequestDto: UpdateTerminalRequestDto,
    userId: string
  ) {
    const existingRequest = await this.prisma.terminalRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      throw new NotFoundException(`Terminal request with ID ${id} not found`);
    }

    // If status is being changed to APPROVED, REJECTED, or FULFILLED, only admins can do it
    if (updateTerminalRequestDto.status) {
      const isStatusChange =
        updateTerminalRequestDto.status !== existingRequest.status;
      const isAdminAction = [
        TerminalRequestStatus.APPROVED,
        TerminalRequestStatus.REJECTED,
        TerminalRequestStatus.FULFILLED,
      ].includes(updateTerminalRequestDto.status);

      if (isStatusChange && isAdminAction) {
        // Check if user is admin - for now, we'll allow it
        // In production, add proper role checking here
      }
    }

    const updateData: any = { ...updateTerminalRequestDto };

    if (updateTerminalRequestDto.status === TerminalRequestStatus.APPROVED) {
      updateData.approvedBy = userId;
      updateData.approvedAt = new Date();
    }

    const updatedRequest = await this.prisma.terminalRequest.update({
      where: { id },
      data: updateData,
      include: {
        outlet: true,
        merchant: true,
        terminals: true,
      },
    });

    return updatedRequest;
  }

  async approveTerminalRequest(id: string, userId: string) {
    const request = await this.prisma.terminalRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Terminal request with ID ${id} not found`);
    }

    if (request.status !== TerminalRequestStatus.PENDING) {
      throw new BadRequestException(
        `Cannot approve request with status ${request.status}`
      );
    }

    // Check inventory availability
    const availableInventory = await this.prisma.terminalInventory.findMany({
      where: {
        modelId: request.modelId,
        status: 'IN_STOCK',
      },
      take: request.quantity,
    });

    if (availableInventory.length < request.quantity) {
      throw new BadRequestException(
        `Insufficient inventory. Requested: ${request.quantity}, Available: ${availableInventory.length}`
      );
    }

    // Update request status
    const updatedRequest = await this.prisma.terminalRequest.update({
      where: { id },
      data: {
        status: TerminalRequestStatus.APPROVED,
        approvedBy: userId,
        approvedAt: new Date(),
      },
      include: {
        outlet: true,
        merchant: true,
      },
    });

    // Allocate terminals from inventory and create terminal records
    const terminals = [];
    const allocations = [];

    for (const inventoryItem of availableInventory) {
      // Mark inventory as allocated
      await this.prisma.terminalInventory.update({
        where: { id: inventoryItem.id },
        data: { status: 'ALLOCATED' },
      });

      // Create allocation record
      const allocation = await this.prisma.terminalAllocation.create({
        data: {
          terminalInventoryId: inventoryItem.id,
          terminalRequestId: id,
          allocatedBy: userId,
        },
      });
      allocations.push(allocation);

      // Create terminal record
      const terminal = await this.prisma.terminal.create({
        data: {
          outletId: request.outletId,
          modelId: request.modelId,
          terminalRequestId: request.id,
          serialNumber: inventoryItem.serialNumber,
          location: request.location,
          status: 'ACTIVE',
        },
      });
      terminals.push(terminal);
    }

    // Update request to FULFILLED
    const fulfilledRequest = await this.prisma.terminalRequest.update({
      where: { id },
      data: {
        status: TerminalRequestStatus.FULFILLED,
        fulfilledAt: new Date(),
      },
      include: {
        outlet: true,
        merchant: true,
        terminals: true,
        allocations: {
          include: {
            terminalInventory: true,
          },
        },
      },
    });

    return fulfilledRequest;
  }

  async rejectTerminalRequest(id: string, userId: string, reason?: string) {
    const request = await this.prisma.terminalRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Terminal request with ID ${id} not found`);
    }

    if (request.status !== TerminalRequestStatus.PENDING) {
      throw new BadRequestException(
        `Cannot reject request with status ${request.status}`
      );
    }

    const updatedRequest = await this.prisma.terminalRequest.update({
      where: { id },
      data: {
        status: TerminalRequestStatus.REJECTED,
        approvedBy: userId,
        approvedAt: new Date(),
        rejectionReason: reason,
      },
      include: {
        outlet: true,
        merchant: true,
      },
    });

    return updatedRequest;
  }

  async deleteTerminalRequest(id: string) {
    const existingRequest = await this.prisma.terminalRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      throw new NotFoundException(`Terminal request with ID ${id} not found`);
    }

    // Only allow deletion of PENDING or CANCELLED requests
    if (
      existingRequest.status !== TerminalRequestStatus.PENDING &&
      existingRequest.status !== TerminalRequestStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot delete a request that has been processed'
      );
    }

    await this.prisma.terminalRequest.delete({
      where: { id },
    });

    return { message: 'Terminal request deleted successfully' };
  }
}
