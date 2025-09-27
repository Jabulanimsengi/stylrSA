import { Controller, Post, Body, UseGuards, Get, Param, Query, ParseFloatPipe, Patch } from '@nestjs/common';
import { SalonsService } from './salons.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateSalonDto } from './dto/create-salon.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User } from '@prisma/client';
import { UpdateSalonDto } from './dto/update-salon.dto';
import { ServicesService } from 'src/services/services.service'; // <-- Import ServicesService
import { CreateServiceDto } from 'src/services/dto/create-service.dto'; // <-- Import the DTO

@Controller('api/salons')
export class SalonsController {
  constructor(
    private readonly salonsService: SalonsService,
    private readonly servicesService: ServicesService, // <-- Inject ServicesService
  ) {}

  // --- NEW ENDPOINT FOR CREATING A SERVICE ---
  @UseGuards(AuthGuard('jwt'))
  @Post(':salonId/services')
  createService(
    @Param('salonId') salonId: string,
    @GetUser() user: User,
    @Body() createServiceDto: CreateServiceDto,
  ) {
    return this.servicesService.create(user.id, salonId, createServiceDto);
  }
  // --- END OF NEW ENDPOINT ---

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
    @Query('sortBy') sortBy?: string,
    @Query('openOn') openOn?: string,
  ) {
    return this.salonsService.findAllApproved({ province, city, offersMobile, sortBy, openOn });
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
  updateMySalon(@GetUser() user: User, @Body() updateSalonDto: UpdateSalonDto) {
    return this.salonsService.updateMySalon(user.id, updateSalonDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('mine/availability')
  toggleAvailability(@GetUser() user: User) {
    return this.salonsService.toggleAvailability(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salonsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mine/bookings')
  findBookingsForMySalon(@GetUser() user: User) {
    return this.salonsService.findBookingsForMySalon(user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mine/services')
  findServicesForMySalon(@GetUser() user: User) {
    return this.salonsService.findServicesForMySalon(user.id);
  }
}