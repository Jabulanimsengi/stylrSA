// backend/src/availability/availability.controller.ts
import { Controller, Get, Put, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  /**
   * Get availability for a specific date
   * GET /api/availability/:salonId?date=YYYY-MM-DD
   */
  @Get(':salonId')
  async getAvailabilityForDate(
    @Param('salonId') salonId: string,
    @Query('date') dateStr: string,
  ) {
    const date = dateStr ? new Date(dateStr) : new Date();
    return this.availabilityService.getAvailabilityForDate(salonId, date);
  }

  /**
   * Get availability for an entire month
   * GET /api/availability/:salonId/month?year=YYYY&month=MM
   */
  @Get(':salonId/month')
  async getAvailabilityForMonth(
    @Param('salonId') salonId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    return this.availabilityService.getAvailabilityForMonth(salonId, yearNum, monthNum);
  }

  /**
   * Update availability for specific hours
   * PUT /api/availability/:salonId
   */
  @UseGuards(JwtGuard)
  @Put(':salonId')
  async updateAvailability(
    @Param('salonId') salonId: string,
    @Body() dto: UpdateAvailabilityDto,
    @GetUser() user: any,
  ) {
    const date = new Date(dto.date);
    return this.availabilityService.updateAvailability(salonId, date, dto.hours, user.id);
  }
}

