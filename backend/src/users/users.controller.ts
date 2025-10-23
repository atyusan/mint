import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, AssignRoleDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { UserType } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions({ resource: 'user', action: 'create' })
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.usersService.createUser(createUserDto, req.user.id);
  }

  @Get()
  @RequirePermissions({ resource: 'user', action: 'read' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userType') userType?: UserType,
  ) {
    return this.usersService.getUsers(page, limit, userType);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'user', action: 'read' })
  async findOne(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'user', action: 'update' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    return this.usersService.updateUser(id, updateUserDto, req.user.id);
  }

  @Patch(':id/status')
  @RequirePermissions({ resource: 'user', action: 'update' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req,
  ) {
    return this.usersService.updateUserStatus(id, status as any, req.user.id);
  }

  @Post(':id/roles')
  @RequirePermissions({ resource: 'user', action: 'update' })
  async assignRole(
    @Param('id') id: string,
    @Body() assignRoleDto: AssignRoleDto,
    @Request() req,
  ) {
    return this.usersService.assignRole(id, assignRoleDto.roleId, req.user.id);
  }

  @Delete(':id/roles/:roleId')
  @RequirePermissions({ resource: 'user', action: 'update' })
  async removeRole(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @Request() req,
  ) {
    return this.usersService.removeRole(id, roleId, req.user.id);
  }

  @Post(':id/permissions/:permissionId')
  @RequirePermissions({ resource: 'user', action: 'update' })
  async assignPermission(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
    @Request() req,
  ) {
    return this.usersService.assignPermission(id, permissionId, req.user.id);
  }

  @Delete(':id/permissions/:permissionId')
  @RequirePermissions({ resource: 'user', action: 'update' })
  async removePermission(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
    @Request() req,
  ) {
    return this.usersService.removePermission(id, permissionId, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'user', action: 'delete' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.usersService.deleteUser(id, req.user.id);
  }
}
