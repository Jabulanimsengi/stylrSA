import { Controller, Post, Body, UseGuards, Get, Param, Query, ParseFloatPipe, Patch } from '@nestjs/common';
import { SalonsService } from './salons.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateSalonDto } from './dto/create-salon.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User } from '@prisma/client';
import { UpdateSalonDto } from './dto/update-salon.dto';
import { ServicesService } from 'src/services/services.service';
import { CreateServiceDto } from 'src/services/dto/create-service.dto';

@Controller('api/salons')
export class SalonsController {
  constructor(
    private readonly salonsService: SalonsService,
    private readonly servicesService: ServicesService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post(':salonId/services')
  createService(
    @Param('salonId') salonId: string,
    @GetUser() user: User,
    @Body() createServiceDto: CreateServiceDto,
  ) {
    return this.servicesService.create(user, salonId, createServiceDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mine')
  findMySalon(@GetUser() user: User, @Query('ownerId') ownerId?: string) {
    return this.salonsService.findMySalon(user, ownerId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createSalonDto: CreateSalonDto, @GetUser() user: User) {
    return this.salonsService.create(user.id, createSalonDto);
  }

  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @Get()
  findAllApproved(
    @GetUser() user: User | null,
    @Query('province') province?: string,
    @Query('city') city?: string,
    @Query('service') service?: string,
    @Query('offersMobile') offersMobile?: string,
    @Query('sortBy') sortBy?: string,
    @Query('openOn') openOn?: string,
  ) {
    return this.salonsService.findAllApproved({ province, city, service, offersMobile, sortBy, openOn }, user);
  }
  
  @Get('nearby')
  findNearby(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lon', ParseFloatPipe) lon: number,
  ) {
    return this.salonsService.findNearby(lat, lon);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('mine')
  updateMySalon(@GetUser() user: User, @Body() updateSalonDto: UpdateSalonDto, @Query('ownerId') ownerId?: string) {
    return this.salonsService.updateMySalon(user, updateSalonDto, ownerId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('mine/availability')
  toggleAvailability(@GetUser() user: User, @Query('ownerId') ownerId?: string) {
    return this.salonsService.toggleAvailability(user, ownerId);
  }

  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User | null) {
    return this.salonsService.findOne(id, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mine/bookings')
  findBookingsForMySalon(@GetUser() user: User, @Query('ownerId') ownerId?: string) {
    return this.salonsService.findBookingsForMySalon(user, ownerId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mine/services')
  findServicesForMySalon(@GetUser() user: User, @Query('ownerId') ownerId?: string) {
    return this.salonsService.findServicesForMySalon(user, ownerId);
  }
}