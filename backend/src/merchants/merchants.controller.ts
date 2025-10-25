import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import {
  CreateMerchantDto,
  CreateMerchantWithUserDto,
  UpdateMerchantDto,
  MerchantOnboardingDto,
  CreateUserDto,
  UpdateUserDto,
  MerchantSearchDto,
} from './dto/merchant.dto';

@Controller('merchants')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Post()
  @RequirePermissions({ resource: 'merchant', action: 'create' })
  async createMerchant(@Body() createMerchantDto: CreateMerchantDto) {
    return this.merchantsService.createMerchant(createMerchantDto);
  }

  @Post('with-user')
  @RequirePermissions({ resource: 'merchant', action: 'create' })
  async createMerchantWithUser(
    @Body() createMerchantWithUserDto: CreateMerchantWithUserDto
  ) {
    return this.merchantsService.createMerchantWithUser(
      createMerchantWithUserDto
    );
  }

  @Get()
  @RequirePermissions({ resource: 'merchant', action: 'read' })
  async getMerchants(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('businessType') businessType?: string
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.merchantsService.getMerchants(
      pageNum,
      limitNum,
      search,
      status,
      businessType
    );
  }

  @Get('search')
  @RequirePermissions({ resource: 'merchant', action: 'read' })
  async searchMerchants(
    @Query('q') query: string,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.merchantsService.searchMerchants(query, limitNum);
  }

  @Get('my-merchant')
  @RequirePermissions({ resource: 'merchant', action: 'read' })
  async getMyMerchant(@Request() req) {
    const userId = req.user.id;
    return this.merchantsService.getMerchantByUserId(userId);
  }

  @Get('my-merchant/stats')
  @RequirePermissions({ resource: 'merchant', action: 'read' })
  async getMyMerchantStats(@Request() req) {
    const userId = req.user.id;
    const merchant = await this.merchantsService.getMerchantByUserId(userId);
    return this.merchantsService.getMerchantStats(merchant.id);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'merchant', action: 'read' })
  async getMerchantById(@Param('id') id: string) {
    return this.merchantsService.getMerchantById(id);
  }

  @Get(':id/stats')
  @RequirePermissions({ resource: 'merchant', action: 'read' })
  async getMerchantStats(@Param('id') id: string) {
    return this.merchantsService.getMerchantStats(id);
  }

  @Put(':id')
  @RequirePermissions({ resource: 'merchant', action: 'update' })
  async updateMerchant(
    @Param('id') id: string,
    @Body() updateMerchantDto: UpdateMerchantDto
  ) {
    return this.merchantsService.updateMerchant(id, updateMerchantDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'merchant', action: 'delete' })
  async deleteMerchant(@Param('id') id: string) {
    return this.merchantsService.deleteMerchant(id);
  }

  @Post('onboard')
  @RequirePermissions({ resource: 'merchant', action: 'create' })
  async onboardMerchant(
    @Request() req,
    @Body() onboardingData: MerchantOnboardingDto
  ) {
    const userId = req.user.id;
    return this.merchantsService.onboardMerchant(userId, onboardingData);
  }

  @Post('users')
  @RequirePermissions({ resource: 'users', action: 'create' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    // This would typically be in a users service
    // For now, we'll return a placeholder
    return { message: 'User creation endpoint - implement in users service' };
  }

  @Put('users/:userId')
  @RequirePermissions({ resource: 'users', action: 'update' })
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    // This would typically be in a users service
    // For now, we'll return a placeholder
    return { message: 'User update endpoint - implement in users service' };
  }
}
