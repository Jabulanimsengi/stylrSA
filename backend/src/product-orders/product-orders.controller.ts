import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProductOrdersService } from './product-orders.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User } from '@prisma/client';
import { CreateProductOrderDto } from './dto/create-product-order.dto';
import { UpdateProductOrderStatusDto } from './dto/update-product-order-status.dto';

@UseGuards(JwtGuard)
@Controller('api/product-orders')
export class ProductOrdersController {
  constructor(private readonly productOrdersService: ProductOrdersService) {}

  @Post()
  create(@GetUser() user: User, @Body() dto: CreateProductOrderDto) {
    return this.productOrdersService.create(user, dto);
  }

  @Get('buyer')
  getBuyerOrders(@GetUser() user: User) {
    return this.productOrdersService.findAllForBuyer(user);
  }

  @Get('seller')
  getSellerOrders(@GetUser() user: User) {
    return this.productOrdersService.findAllForSeller(user);
  }

  @Patch(':id/status')
  updateStatus(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateProductOrderStatusDto,
  ) {
    return this.productOrdersService.updateStatus(user, id, dto.status);
  }
}
