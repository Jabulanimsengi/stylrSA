import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User } from '@prisma/client';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@GetUser() user: User, @Body() createProductDto: CreateProductDto) {
    return this.productsService.create(user, createProductDto);
  }

  @Get()
  findAllApproved() {
    return this.productsService.findAllApproved();
  }

  @UseGuards(JwtGuard)
  @Get('mine')
  findMyProducts(@GetUser() user: User) {
    return this.productsService.findMyProducts(user);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(user, id, updateProductDto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@GetUser() user: User, @Param('id') id: string) {
    return this.productsService.remove(user, id);
  }
}
