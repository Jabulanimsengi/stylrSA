import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import {
  CreatePromotionDto,
  ApprovePromotionDto,
} from './dto/create-promotion.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/guard/roles.decorator';

@Controller('api/promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  // Public endpoint - get all approved active promotions
  @Get('public')
  findAllPublic(@Query('salonId') salonId?: string) {
    return this.promotionsService.findAllPublic(salonId);
  }

  // Salon owner - create promotion
  @UseGuards(JwtGuard)
  @Post()
  create(@GetUser() user: any, @Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(user, createPromotionDto);
  }

  // Salon owner - get their promotions (active and expired)
  @UseGuards(JwtGuard)
  @Get('my-salon')
  findForSalon(@GetUser() user: any) {
    return this.promotionsService.findForSalon(user);
  }

  // Salon owner or admin - delete promotion
  @UseGuards(JwtGuard)
  @Delete(':id')
  delete(@GetUser() user: any, @Param('id') id: string) {
    return this.promotionsService.delete(user, id);
  }

  // Admin only - get all pending promotions
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/pending')
  findAllForAdmin(@GetUser() user: any) {
    return this.promotionsService.findAllForAdmin();
  }

  // Admin only - approve promotion
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id/approve')
  approve(@GetUser() user: any, @Param('id') id: string) {
    return this.promotionsService.approve(user, id);
  }

  // Admin only - reject promotion
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id/reject')
  reject(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() dto: ApprovePromotionDto,
  ) {
    return this.promotionsService.reject(user, id, dto.reason);
  }
}
