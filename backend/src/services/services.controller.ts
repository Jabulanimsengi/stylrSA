import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { User } from '@prisma/client';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@GetUser() user: User, @Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(user, createServiceDto);
  }

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }
  
  // FIX: Added the missing /approved route
  @Get('approved')
  findAllApproved(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.servicesService.findAllApproved(page, pageSize);
  }

  @Get('salon/:salonId')
  findAllForSalon(@Param('salonId') salonId: string) {
    return this.servicesService.findAllForSalon(salonId);
  }

  @Get('featured')
  findFeatured() {
    return this.servicesService.findFeatured();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(user, id, updateServiceDto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@GetUser() user: User, @Param('id') id: string) {
    return this.servicesService.remove(user, id);
  }
}