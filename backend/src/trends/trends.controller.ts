import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { TrendsService } from './trends.service';
import { TrendsSalonsService } from './trends-salons.service';
import { CreateTrendDto, UpdateTrendDto } from './dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/guard/roles.decorator';
import { TrendCategory } from '@prisma/client';

@Controller('api/trends')
export class TrendsController {
  constructor(
    private readonly trendsService: TrendsService,
    private readonly trendsSalonsService: TrendsSalonsService,
  ) {}

  // ==================== PUBLIC ENDPOINTS ====================

  /**
   * Get all active trends grouped by category
   * GET /api/trends
   */
  @Get()
  findAllActive() {
    return this.trendsService.findAllActive();
  }

  /**
   * Get trends by category
   * GET /api/trends/category/:category
   */
  @Get('category/:category')
  findByCategory(
    @Param('category') category: TrendCategory,
    @Query('userId') userId?: string,
  ) {
    return this.trendsService.findByCategory(category, userId);
  }

  /**
   * Get single trend by ID
   * GET /api/trends/:id
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('userId') userId?: string,
    @Req() req?: any,
  ) {
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || req?.connection?.remoteAddress;
    return this.trendsService.findOne(id, userId, ipAddress);
  }

  // ==================== USER ENDPOINTS ====================

  /**
   * Like a trend
   * POST /api/trends/:id/like
   */
  @UseGuards(JwtGuard)
  @Post(':id/like')
  like(@GetUser() user: any, @Param('id') id: string) {
    return this.trendsService.like(user.id, id);
  }

  /**
   * Unlike a trend
   * POST /api/trends/:id/unlike
   */
  @UseGuards(JwtGuard)
  @Post(':id/unlike')
  unlike(@GetUser() user: any, @Param('id') id: string) {
    return this.trendsService.unlike(user.id, id);
  }

  /**
   * Get user's liked trends
   * GET /api/trends/my/likes
   */
  @UseGuards(JwtGuard)
  @Get('my/likes')
  getUserLikes(@GetUser() user: any) {
    return this.trendsService.getUserLikes(user.id);
  }

  /**
   * Track click-through
   * POST /api/trends/:id/click
   */
  @Post(':id/click')
  trackClickThrough(@Param('id') id: string) {
    return this.trendsService.trackClickThrough(id);
  }

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Get all trends for admin
   * GET /api/trends/admin/all
   */
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  findAllForAdmin() {
    return this.trendsService.findAllForAdmin();
  }

  /**
   * Create a trend (Admin only)
   * POST /api/trends/admin
   */
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin')
  create(@GetUser() user: any, @Body() dto: CreateTrendDto) {
    return this.trendsService.create(user, dto);
  }

  /**
   * Update a trend (Admin only)
   * PUT /api/trends/admin/:id
   */
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('admin/:id')
  update(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateTrendDto,
  ) {
    return this.trendsService.update(user, id, dto);
  }

  /**
   * Delete a trend (Admin only)
   * DELETE /api/trends/admin/:id
   */
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('admin/:id')
  delete(@GetUser() user: any, @Param('id') id: string) {
    return this.trendsService.delete(user, id);
  }

  // ==================== SALON RECOMMENDATIONS ====================

  /**
   * Get recommended salons for a trend
   * GET /api/trends/:id/salons
   */
  @Get(':id/salons')
  getRecommendedSalons(
    @Param('id') id: string,
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
    @Query('radius') radius?: string,
  ) {
    const latitude = lat ? parseFloat(lat) : undefined;
    const longitude = lon ? parseFloat(lon) : undefined;
    const radiusKm = radius ? parseInt(radius) : 25;
    return this.trendsSalonsService.getRecommendedSalons(
      id,
      latitude,
      longitude,
      radiusKm,
    );
  }

  /**
   * Track salon click from trend
   * POST /api/trends/:trendId/salons/:salonId/click
   */
  @Post(':trendId/salons/:salonId/click')
  trackSalonClick(
    @Param('trendId') trendId: string,
    @Param('salonId') salonId: string,
  ) {
    return this.trendsSalonsService.trackSalonClick(trendId, salonId);
  }

  /**
   * Admin: Get all salons with Trendz profile
   * GET /api/trends/admin/salons
   */
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/salons')
  getAllSalonsWithTrendzProfile() {
    return this.trendsSalonsService.getAllSalonsWithTrendzProfile();
  }

  /**
   * Admin: Update salon Trendz profile
   * PUT /api/trends/admin/salons/:salonId
   */
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('admin/salons/:salonId')
  updateSalonTrendzProfile(
    @Param('salonId') salonId: string,
    @Body() data: any,
  ) {
    return this.trendsSalonsService.updateSalonTrendzProfile(salonId, data);
  }
}
