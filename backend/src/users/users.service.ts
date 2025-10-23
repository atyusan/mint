import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserType, UserStatus } from '@prisma/client';
import { CreateUserDto, UpdateUserDto, AssignRoleDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto, createdBy: string) {
    const { userType, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create user with required fields
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        userType,
        status: UserStatus.PENDING_VERIFICATION,
        passwordHash: 'temp_password', // This should be hashed properly in a real implementation
      },
    });

    // Create profile based on user type
    if (userType === UserType.MERCHANT) {
      await this.prisma.merchant.create({
        data: {
          userId: user.id,
          businessName: userData.businessName || '',
          businessType: userData.businessType || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
        },
      });
    } else if (userType === UserType.INDIVIDUAL) {
      await this.prisma.individual.create({
        data: {
          userId: user.id,
          address: userData.address,
          city: userData.city,
          state: userData.state,
        },
      });
    }

    return this.getUserById(user.id);
  }

  async getUsers(page: number = 1, limit: number = 10, userType?: UserType) {
    const skip = (page - 1) * limit;

    const where = userType ? { userType } : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          merchant: true,
          individual: true,
          userRoles: {
            include: {
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        merchant: true,
        individual: true,
        userRoles: {
          include: {
            role: true,
          },
        },
        userPermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    updatedBy: string
  ) {
    const user = await this.getUserById(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        updatedAt: new Date(),
      },
      include: {
        merchant: true,
        individual: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Log the update
    await this.logUserAction(
      updatedBy,
      'UPDATE',
      'USER',
      id,
      user,
      updatedUser
    );

    return updatedUser;
  }

  async updateUserStatus(id: string, status: UserStatus, updatedBy: string) {
    const user = await this.getUserById(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { status },
      include: {
        merchant: true,
        individual: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Log the status change
    await this.logUserAction(
      updatedBy,
      'UPDATE_STATUS',
      'USER',
      id,
      user,
      updatedUser
    );

    return updatedUser;
  }

  async assignRole(userId: string, roleId: string, assignedBy: string) {
    const user = await this.getUserById(userId);
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if user already has this role
    const existingUserRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (existingUserRole) {
      throw new BadRequestException('User already has this role');
    }

    await this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });

    // Log the role assignment
    await this.logUserAction(assignedBy, 'ASSIGN_ROLE', 'USER', userId, null, {
      roleId,
      roleName: role.name,
    });

    return this.getUserById(userId);
  }

  async removeRole(userId: string, roleId: string, removedBy: string) {
    const userRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
      include: {
        role: true,
      },
    });

    if (!userRole) {
      throw new NotFoundException('User role not found');
    }

    await this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    // Log the role removal
    await this.logUserAction(removedBy, 'REMOVE_ROLE', 'USER', userId, null, {
      roleId,
      roleName: userRole.role.name,
    });

    return this.getUserById(userId);
  }

  async assignPermission(
    userId: string,
    permissionId: string,
    assignedBy: string
  ) {
    const user = await this.getUserById(userId);
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    // Check if user already has this permission
    const existingUserPermission = await this.prisma.userPermission.findUnique({
      where: {
        userId_permissionId: {
          userId,
          permissionId,
        },
      },
    });

    if (existingUserPermission) {
      throw new BadRequestException('User already has this permission');
    }

    await this.prisma.userPermission.create({
      data: {
        userId,
        permissionId,
      },
    });

    // Log the permission assignment
    await this.logUserAction(
      assignedBy,
      'ASSIGN_PERMISSION',
      'USER',
      userId,
      null,
      {
        permissionId,
        permissionName: permission.name,
      }
    );

    return this.getUserById(userId);
  }

  async removePermission(
    userId: string,
    permissionId: string,
    removedBy: string
  ) {
    const userPermission = await this.prisma.userPermission.findUnique({
      where: {
        userId_permissionId: {
          userId,
          permissionId,
        },
      },
      include: {
        permission: true,
      },
    });

    if (!userPermission) {
      throw new NotFoundException('User permission not found');
    }

    await this.prisma.userPermission.delete({
      where: {
        userId_permissionId: {
          userId,
          permissionId,
        },
      },
    });

    // Log the permission removal
    await this.logUserAction(
      removedBy,
      'REMOVE_PERMISSION',
      'USER',
      userId,
      null,
      {
        permissionId,
        permissionName: userPermission.permission.name,
      }
    );

    return this.getUserById(userId);
  }

  async deleteUser(id: string, deletedBy: string) {
    const user = await this.getUserById(id);

    // Check if user has any active transactions
    const activeInvoices = await this.prisma.invoice.count({
      where: {
        outlet: {
          merchant: {
            userId: id,
          },
        },
        status: {
          in: ['PENDING', 'PARTIALLY_PAID'],
        },
      },
    });

    if (activeInvoices > 0) {
      throw new BadRequestException(
        'Cannot delete user with active invoices. Please cancel or complete all invoices first.'
      );
    }

    await this.prisma.user.delete({
      where: { id },
    });

    // Log the deletion
    await this.logUserAction(deletedBy, 'DELETE', 'USER', id, user, null);

    return { message: 'User deleted successfully' };
  }

  private async logUserAction(
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
