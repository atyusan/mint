import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY, Permission } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user permissions (both direct and through roles)
    const userPermissions = await this.getUserPermissions(user.id);

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((required) =>
      userPermissions.some(
        (userPerm) =>
          userPerm.resource === required.resource &&
          userPerm.action === required.action,
      ),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        'Insufficient permissions to perform this action',
      );
    }

    return true;
  }

  private async getUserPermissions(userId: string): Promise<Permission[]> {
    const userWithPermissions = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userPermissions: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userWithPermissions) {
      return [];
    }

    const permissions: Permission[] = [];

    // Add direct user permissions
    userWithPermissions.userPermissions.forEach((userPerm) => {
      permissions.push({
        resource: userPerm.permission.resource,
        action: userPerm.permission.action,
      });
    });

    // Add role-based permissions
    userWithPermissions.userRoles.forEach((userRole) => {
      userRole.role.permissions.forEach((rolePerm) => {
        permissions.push({
          resource: rolePerm.permission.resource,
          action: rolePerm.permission.action,
        });
      });
    });

    // Remove duplicates
    const uniquePermissions = permissions.filter(
      (perm, index, self) =>
        index ===
        self.findIndex(
          (p) => p.resource === perm.resource && p.action === perm.action,
        ),
    );

    return uniquePermissions;
  }
}
