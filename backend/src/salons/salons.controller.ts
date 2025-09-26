// backend/src/salons/salons.controller.ts
import { Controller, Post, Body, UseGuards, Get, Param, Query } from '@nestjs/common';
import { SalonsService } from './salons.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateSalonDto } from './dto/create-salon.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User } from '@prisma/client';

@Controller('api/salons')
export class SalonsController {
  constructor(private readonly salonsService: SalonsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('mine')
  findMySalon(@GetUser() user: User) {
    return this.salonsService.findMySalon(user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createSalonDto: CreateSalonDto, @GetUser() user: User) {
    return this.salonsService.create(user.id, createSalonDto);
  }

  @Get()
  findAllApproved(
    @Query('province') province?: string,
    @Query('city') city?: string,
    @Query('offersMobile') offersMobile?: string,
  ) {
    return this.salonsService.findAllApproved({ province, city, offersMobile });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salonsService.findOne(id);
  }
}