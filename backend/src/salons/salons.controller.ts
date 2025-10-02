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

@UseGuards(JwtGuard)
@Controller('salons')
export class SalonsController {
  constructor(private readonly salonsService: SalonsService) {}

  @Post()
  create(
    @GetUser() user: User,
    @Body() createSalonDto: CreateSalonDto,
  ) {
    return this.salonsService.create(user.id, createSalonDto);
  }

  @Get('my-salon/:ownerId')
  findMySalon(@GetUser() user: User, @Param('ownerId') ownerId: string) {
    return this.salonsService.findMySalon(user, ownerId);
  }

  @Get('approved')
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

  @Patch('my-salon/:ownerId')
  updateMySalon(
    @GetUser() user: User,
    @Body() updateSalonDto: UpdateSalonDto,
    @Param('ownerId') ownerId: string,
  ) {
    return this.salonsService.updateMySalon(user, updateSalonDto, ownerId);
  }
  
  @Patch('my-salon/:ownerId/toggle-availability')
  toggleAvailability(
    @GetUser() user: User,
    @Param('ownerId') ownerId: string,
  ) {
    return this.salonsService.toggleAvailability(user, ownerId);
  }

  @Get('my-salon/:ownerId/bookings')
  findBookingsForMySalon(
    @GetUser() user: User,
    @Param('ownerId') ownerId: string,
  ) {
    return this.salonsService.findBookingsForMySalon(user, ownerId);
  }

  @Get('my-salon/:ownerId/services')
  findServicesForMySalon(
    @GetUser() user: User,
    @Param('ownerId') ownerId: string,
  ) {
    return this.salonsService.findServicesForMySalon(user, ownerId);
  }

  @Delete(':id')
  remove(@GetUser() user: User, @Param('id') id: string) {
    return this.salonsService.remove(user, id);
  }
}