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
  Put, // Import the Put decorator
} from '@nestjs/common';
import { SalonsService } from './salons.service';
import { CreateSalonDto, UpdateSalonDto } from './dto';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guard/optional-jwt.guard';

@Controller('api/salons')
export class SalonsController {
  constructor(private readonly salonsService: SalonsService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@GetUser() user: any, @Body() createSalonDto: CreateSalonDto) {
    return this.salonsService.create(user.id, createSalonDto);
  }

  @UseGuards(JwtGuard)
  @Get('my-salon')
  findMySalon(@GetUser() user: any, @Query('ownerId') ownerId?: string) {
    const id = user.role === 'ADMIN' && ownerId ? ownerId : user.id;
    return this.salonsService.findMySalon(user, id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('approved')
  findAllApproved(
    @Query('province') province: string,
    @Query('city') city: string,
    @Query('service') service: string,
    @Query('category') category: string,
    @Query('q') q: string,
    @Query('offersMobile') offersMobile: boolean,
    @Query('sortBy') sortBy: string,
    @Query('openOn') openOn: string,
    @Query('openNow') openNow: string,
    @Query('priceMin') priceMin: string,
    @Query('priceMax') priceMax: string,
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @GetUser() user: any,
  ) {
    return this.salonsService.findAllApproved(
      {
        province,
        city,
        service,
        category,
        q,
        offersMobile,
        sortBy,
        openOn,
        openNow,
        priceMin,
        priceMax,
        lat,
        lon,
      },
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
  @Put('mine') // FIX: Changed from @Patch to @Put to match the frontend request
  updateMySalon(
    @GetUser() user: any,
    @Body() updateSalonDto: UpdateSalonDto,
    @Query('ownerId') ownerId?: string,
  ) {
    const id = user.role === 'ADMIN' && ownerId ? ownerId : user.id;
    return this.salonsService.updateMySalon(user, updateSalonDto, id);
  }

  @UseGuards(JwtGuard)
  @Patch('mine/availability')
  toggleAvailability(@GetUser() user: any, @Query('ownerId') ownerId?: string) {
    const id = user.role === 'ADMIN' && ownerId ? ownerId : user.id;
    return this.salonsService.toggleAvailability(user, id);
  }

  @UseGuards(JwtGuard)
  @Get('mine/bookings')
  findBookingsForMySalon(
    @GetUser() user: any,
    @Query('ownerId') ownerId?: string,
  ) {
    const id = user.role === 'ADMIN' && ownerId ? ownerId : user.id;
    return this.salonsService.findBookingsForMySalon(user, id);
  }

  @UseGuards(JwtGuard)
  @Get('mine/services')
  findServicesForMySalon(
    @GetUser() user: any,
    @Query('ownerId') ownerId?: string,
  ) {
    const id = user.role === 'ADMIN' && ownerId ? ownerId : user.id;
    return this.salonsService.findServicesForMySalon(user, id);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@GetUser() user: any, @Param('id') id: string) {
    return this.salonsService.remove(user, id);
  }
}
