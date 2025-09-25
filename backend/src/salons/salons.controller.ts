// backend/src/salons/salons.controller.ts
import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { SalonsService } from './salons.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateSalonDto } from './dto/create-salon.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User } from '@prisma/client';

@Controller('api/salons')
export class SalonsController {
  constructor(private readonly salonsService: SalonsService) {}

  // GET /api/salons/mine (Get the logged-in user's salon)
  @UseGuards(AuthGuard('jwt'))
  @Get('mine') // This route must come BEFORE '/:id' to be matched correctly
  findMySalon(@GetUser() user: User) {
    return this.salonsService.findMySalon(user.id);
  }

  // POST /api/salons (Create a salon - already done)
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createSalonDto: CreateSalonDto, @GetUser() user: User) {
    return this.salonsService.create(user.id, createSalonDto);
  }

  // GET /api/salons (List all approved salons)
  @Get()
  findAllApproved() {
    return this.salonsService.findAllApproved();
  }

  // GET /api/salons/:id (Get a single salon's details)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salonsService.findOne(id);
  }
}