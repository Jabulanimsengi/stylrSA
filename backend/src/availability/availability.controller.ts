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
    let date: Date;
    if (dateStr) {
      // Parse date string as local date (YYYY-MM-DD format)
      // new Date("2024-01-15") interprets as UTC, so we need to parse it as local
      const [year, month, day] = dateStr.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date();
    }
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
    // Parse date string as local date (YYYY-MM-DD format)
    // new Date("2024-01-15") interprets as UTC, so we need to parse it as local
    const [year, month, day] = dto.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return this.availabilityService.updateAvailability(salonId, date, dto.hours, user.id);
  }
}

