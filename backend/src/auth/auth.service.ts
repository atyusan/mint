import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserType, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: UserType;
  businessName?: string;
  businessType?: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, userType, ...userData } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        userType,
        status: UserStatus.PENDING_VERIFICATION,
      },
    });

    // Create merchant or individual profile based on user type
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

    // Assign default role based on user type
    await this.assignDefaultRole(user.id, userType);

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        status: user.status,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
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

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        status: user.status,
        merchant: user.merchant,
        individual: user.individual,
        roles: user.userRoles.map((ur) => ur.role),
      },
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  private async assignDefaultRole(userId: string, userType: UserType) {
    let roleName: string;

    switch (userType) {
      case UserType.ADMIN:
        roleName = 'admin';
        break;
      case UserType.MERCHANT:
        roleName = 'merchant';
        break;
      case UserType.INDIVIDUAL:
        roleName = 'individual';
        break;
      default:
        throw new BadRequestException('Invalid user type');
    }

    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (role) {
      await this.prisma.userRole.create({
        data: {
          userId,
          roleId: role.id,
        },
      });
    }
  }
}
