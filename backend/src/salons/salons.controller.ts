// backend/src/salons/salons.controller.ts
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
} from '@nestjs/common';
import { SalonsService } from './salons.service';
import { CreateSalonDto, UpdateSalonDto } from './dto';
import { GetUser } from '../auth/decorator/get-user.decorator'; // Corrected import path
import { JwtGuard } from '../auth/guard/jwt.guard'; // Corrected import path
import { User } from '@prisma/client'; // Corrected import

@Controller('api/salons')
export class SalonsController {
  constructor(private readonly salonsService: SalonsService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(
    @GetUser() user: User,
    @Body() createSalonDto: CreateSalonDto,
  ) {
    return this.salonsService.create(user.id, createSalonDto);
  }

  @UseGuards(JwtGuard)
  @Get('my-salon')
  findMySalon(@GetUser() user: User, @Query('ownerId') ownerId?: string) {
    const id = user.role === 'ADMIN' && ownerId ? ownerId : user.id;
    return this.salonsService.findMySalon(user, id);
  }
  
  @Get()
  findAllApproved(
    @Query('province') province: string,
    @Query('city') city: string,
    @Query('service') service: string,
    @Query('offersMobile') offersMobile: boolean,
    @Query('sortBy') sortBy: string,
    @Query('openOn') openOn: string,
    @GetUser() user: User,
  ) {
    return this.salonsService.findAllApproved(
      { province, city, service, offersMobile, sortBy, openOn },
      user,
    );
  }

  @Get('nearby')
  findNearby(@Query('lat') lat: number, @Query('lon') lon: number) {
    return this.salonsService.findNearby(lat, lon);
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salonsService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Patch('mine')
  updateMySalon(
    @GetUser() user: User,
    @Body() updateSalonDto: UpdateSalonDto,
    @Query('ownerId') ownerId?: string,
  ) {
    const id = user.role === 'ADMIN' && ownerId ? ownerId : user.id;
    return this.salonsService.updateMySalon(user, updateSalonDto, id);
  }
  
  @UseGuards(JwtGuard)
  @Patch('mine/availability')
  toggleAvailability(
    @GetUser() user: User,
    @Query('ownerId') ownerId?: string,
  ) {
    const id = user.role === 'ADMIN' && ownerId ? ownerId : user.id;
    return this.salonsService.toggleAvailability(user, id);
  }

  @UseGuards(JwtGuard)
  @Get('mine/bookings')
  findBookingsForMySalon(
    @GetUser() user: User,
    @Query('ownerId') ownerId?: string,
  ) {
    const id = user.role === 'ADMIN' && ownerId ? ownerId : user.id;
    return this.salonsService.findBookingsForMySalon(user, id);
  }

  @UseGuards(JwtGuard)
  @Get('mine/services')
  findServicesForMySalon(
    @GetUser() user: User,
    @Query('ownerId') ownerId?: string,
  ) {
    const id = user.role === 'ADMIN' && ownerId ? ownerId : user.id;
    return this.salonsService.findServicesForMySalon(user, id);
  }
  
  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@GetUser() user: User, @Param('id') id: string) {
    return this.salonsService.remove(user, id);
  }
}