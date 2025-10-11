import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';

@UseGuards(JwtGuard)
@Controller('api/promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  create(
    @GetUser() user: any,
    @Body() createPromotionDto: CreatePromotionDto,
  ) {
    return this.promotionsService.create(user, createPromotionDto);
  }

  @Get('salon/:salonId')
  findForSalon(@GetUser() user: any, @Param('salonId') salonId: string) {
    return this.promotionsService.findForSalon(user, salonId);
  }
}
