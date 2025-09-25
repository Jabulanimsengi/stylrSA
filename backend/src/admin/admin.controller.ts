// backend/src/admin/admin.controller.ts
import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { UserRole } from '@prisma/client';
import { UpdateServiceStatusDto } from './dto/update-service-status.dto';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('services/:serviceId/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Apply both guards
  @Roles(UserRole.ADMIN) // Specify that ONLY ADMINs can access this
  updateServiceStatus(
    @Param('serviceId') serviceId: string,
    @Body() dto: UpdateServiceStatusDto,
  ) {
    return this.adminService.updateServiceStatus(serviceId, dto);
  }
}