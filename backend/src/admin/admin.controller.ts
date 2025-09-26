// backend/src/admin/admin.controller.ts
import { Controller, Patch, Param, Body, UseGuards, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { UserRole } from '@prisma/client';
import { UpdateServiceStatusDto } from './dto/update-service-status.dto';

@Controller('api/admin')
@UseGuards(AuthGuard('jwt'), RolesGuard) // Protect all routes in this controller
@Roles(UserRole.ADMIN) // Restrict to ADMIN role only
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('services/pending')
  getPendingServices() {
    return this.adminService.getPendingServices();
  }

  @Get('salons/pending')
  getPendingSalons() {
    return this.adminService.getPendingSalons();
  }

  @Patch('services/:serviceId/status')
  updateServiceStatus(
    @Param('serviceId') serviceId: string,
    @Body() dto: UpdateServiceStatusDto,
  ) {
    return this.adminService.updateServiceStatus(serviceId, dto);
  }

  @Patch('salons/:salonId/status')
  updateSalonStatus(
    @Param('salonId') salonId: string,
    @Body() dto: UpdateServiceStatusDto,
  ) {
    return this.adminService.updateSalonStatus(salonId, dto);
  }
}