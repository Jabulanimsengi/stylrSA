import { Controller, Patch, Param, Body, UseGuards, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { UserRole, ApprovalStatus } from '@prisma/client';
import { UpdateServiceStatusDto } from './dto/update-service-status.dto';

@Controller('api/admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('salons/all')
  getAllSalons() {
    return this.adminService.getAllSalons();
  }

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
    @Body() { approvalStatus }: UpdateServiceStatusDto,
  ) {
    return this.adminService.updateServiceStatus(
      serviceId,
      approvalStatus as ApprovalStatus,
    );
  }

  @Patch('salons/:salonId/status')
  updateSalonStatus(
    @Param('salonId') salonId: string,
    @Body() { approvalStatus }: UpdateServiceStatusDto,
  ) {
    return this.adminService.updateSalonStatus(
      salonId,
      approvalStatus as ApprovalStatus,
    );
  }

  @Get('reviews/pending')
  getPendingReviews() {
    return this.adminService.getPendingReviews();
  }

  @Patch('reviews/:reviewId/status')
  updateReviewStatus(
    @Param('reviewId') reviewId: string,
    @Body() { approvalStatus }: UpdateServiceStatusDto,
  ) {
    return this.adminService.updateReviewStatus(
      reviewId,
      approvalStatus as ApprovalStatus,
    );
  }

  @Get('products/pending')
  getPendingProducts() {
    return this.adminService.getPendingProducts();
  }

  @Patch('products/:productId/status')
  updateProductStatus(
    @Param('productId') productId: string,
    @Body() { approvalStatus }: UpdateServiceStatusDto,
  ) {
    return this.adminService.updateProductStatus(
      productId,
      approvalStatus as ApprovalStatus,
    );
  }
}
