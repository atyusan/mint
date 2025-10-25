import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMerchantDto,
  CreateMerchantWithUserDto,
  UpdateMerchantDto,
  MerchantOnboardingDto,
} from './dto/merchant.dto';
import { UserType, UserStatus } from '@prisma/client';

@Injectable()
export class MerchantsService {
  constructor(private prisma: PrismaService) {}

  async createMerchant(createMerchantDto: CreateMerchantDto) {
    const { userId, ...merchantData } = createMerchantDto;

    // Check if user exists and is not already a merchant
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { merchant: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.merchant) {
      throw new BadRequestException('User is already a merchant');
    }

    if (user.userType !== UserType.MERCHANT) {
      throw new BadRequestException('User type must be MERCHANT');
    }

    // Create merchant
    const merchant = await this.prisma.merchant.create({
      data: {
        ...merchantData,
        userId,
      },
      include: {
        user: true,
        outlets: true,
      },
    });

    return merchant;
  }

  async createMerchantWithUser(
    createMerchantWithUserDto: CreateMerchantWithUserDto
  ) {
    const { firstName, lastName, email, password, ...merchantData } =
      createMerchantWithUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync(password, 12);

    // Create user and merchant in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash: hashedPassword,
          userType: UserType.MERCHANT,
          status: UserStatus.ACTIVE,
          emailVerified: true,
        },
      });

      // Create merchant
      const merchant = await prisma.merchant.create({
        data: {
          ...merchantData,
          userId: user.id,
        },
        include: {
          user: true,
          outlets: true,
        },
      });

      return merchant;
    });

    return result;
  }

  async getMerchants(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    businessType?: string
  ) {
    const validPage = isNaN(page) || page < 1 ? 1 : page;
    const validLimit = isNaN(limit) || limit < 1 ? 10 : limit;
    const skip = (validPage - 1) * validLimit;

    const where: any = {};

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.user = { ...where.user, status: status as UserStatus };
    }

    if (businessType) {
      where.businessType = businessType;
    }

    const [merchants, total] = await Promise.all([
      this.prisma.merchant.findMany({
        where,
        skip,
        take: validLimit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              status: true,
              lastLoginAt: true,
            },
          },
          outlets: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              state: true,
              country: true,
              phone: true,
              email: true,
              isActive: true,
              terminals: {
                select: {
                  id: true,
                  serialNumber: true,
                  status: true,
                  isOnline: true,
                  location: true,
                },
              },
            },
          },
          _count: {
            select: {
              outlets: true,
              payouts: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.merchant.count({ where }),
    ]);

    return {
      data: merchants,
      total,
      page: validPage,
      limit: validLimit,
    };
  }

  async getMerchantById(id: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
            status: true,
            emailVerified: true,
            phoneVerified: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
        outlets: {
          include: {
            terminals: {
              select: {
                id: true,
                serialNumber: true,
                status: true,
                isOnline: true,
              },
            },
            _count: {
              select: {
                terminals: true,
                invoices: true,
              },
            },
          },
        },
        PayoutMethod: true,
        _count: {
          select: {
            outlets: true,
            payouts: true,
          },
        },
      },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return merchant;
  }

  async getMerchantByUserId(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
            status: true,
            emailVerified: true,
            phoneVerified: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
        outlets: {
          include: {
            terminals: {
              select: {
                id: true,
                serialNumber: true,
                status: true,
                isOnline: true,
              },
            },
            _count: {
              select: {
                terminals: true,
                invoices: true,
              },
            },
          },
        },
        PayoutMethod: true,
        _count: {
          select: {
            outlets: true,
            payouts: true,
          },
        },
      },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return merchant;
  }

  async updateMerchant(id: string, updateMerchantDto: UpdateMerchantDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const updatedMerchant = await this.prisma.merchant.update({
      where: { id },
      data: updateMerchantDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
          },
        },
        outlets: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    return updatedMerchant;
  }

  async deleteMerchant(id: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id },
      include: {
        outlets: {
          include: {
            terminals: true,
          },
        },
      },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Check if merchant has active outlets or terminals
    const hasActiveOutlets = merchant.outlets.some((outlet) => outlet.isActive);
    const hasActiveTerminals = merchant.outlets.some((outlet) =>
      outlet.terminals.some((terminal) => terminal.status === 'ACTIVE')
    );

    if (hasActiveOutlets || hasActiveTerminals) {
      throw new BadRequestException(
        'Cannot delete merchant with active outlets or terminals. Please deactivate them first.'
      );
    }

    // Soft delete by updating user status
    await this.prisma.user.update({
      where: { id: merchant.userId },
      data: { status: UserStatus.INACTIVE },
    });

    return { message: 'Merchant deactivated successfully' };
  }

  async onboardMerchant(userId: string, onboardingData: MerchantOnboardingDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { merchant: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.merchant) {
      throw new BadRequestException('User is already a merchant');
    }

    if (user.userType !== UserType.MERCHANT) {
      throw new BadRequestException('User type must be MERCHANT');
    }

    // Create merchant with onboarding data
    const merchant = await this.prisma.merchant.create({
      data: {
        userId,
        businessName: onboardingData.businessName,
        businessType: onboardingData.businessType,
        registrationNumber: onboardingData.registrationNumber,
        taxId: onboardingData.taxId,
        address: onboardingData.address,
        city: onboardingData.city,
        state: onboardingData.state,
        country: onboardingData.country || 'Nigeria',
        website: onboardingData.website,
        description: onboardingData.description,
      },
      include: {
        user: true,
      },
    });

    // Update user status to active
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.ACTIVE,
        emailVerified: true,
      },
    });

    return merchant;
  }

  async getMerchantStats(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      include: {
        outlets: {
          include: {
            terminals: true,
            invoices: {
              select: {
                amount: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Calculate stats
    const totalOutlets = merchant.outlets.length;
    const activeOutlets = merchant.outlets.filter(
      (outlet) => outlet.isActive
    ).length;
    const totalTerminals = merchant.outlets.reduce(
      (sum, outlet) => sum + outlet.terminals.length,
      0
    );
    const activeTerminals = merchant.outlets.reduce(
      (sum, outlet) =>
        sum +
        outlet.terminals.filter((terminal) => terminal.status === 'ACTIVE')
          .length,
      0
    );

    const allInvoices = merchant.outlets.flatMap((outlet) => outlet.invoices);
    const totalInvoices = allInvoices.length;
    const paidInvoices = allInvoices.filter(
      (invoice) => invoice.status === 'PAID'
    ).length;
    const totalRevenue = allInvoices
      .filter((invoice) => invoice.status === 'PAID')
      .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

    const successRate =
      totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

    return {
      totalOutlets,
      activeOutlets,
      totalTerminals,
      activeTerminals,
      totalInvoices,
      paidInvoices,
      totalRevenue,
      successRate,
    };
  }

  async searchMerchants(query: string, limit: number = 10) {
    const merchants = await this.prisma.merchant.findMany({
      where: {
        OR: [
          { businessName: { contains: query, mode: 'insensitive' } },
          { user: { firstName: { contains: query, mode: 'insensitive' } } },
          { user: { lastName: { contains: query, mode: 'insensitive' } } },
          { user: { email: { contains: query, mode: 'insensitive' } } },
        ],
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
          },
        },
        _count: {
          select: {
            outlets: true,
          },
        },
      },
      orderBy: { businessName: 'asc' },
    });

    return merchants;
  }
}
