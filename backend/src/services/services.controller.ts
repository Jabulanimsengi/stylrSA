// backend/src/services/services.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Get,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User } from '@prisma/client';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('api') // Using a common root for different route structures
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // GET /api/salons/:salonId/services
  @Get('salons/:salonId/services')
  findAllForSalon(@Param('salonId') salonId: string) {
    return this.servicesService.findAllForSalon(salonId);
  }

  // POST /api/salons/:salonId/services
  @UseGuards(AuthGuard('jwt'))
  @Post('salons/:salonId/services')
  create(
    @Param('salonId') salonId: string,
    @GetUser() user: User,
    @Body() createServiceDto: CreateServiceDto,
  ) {
    return this.servicesService.create(user.id, salonId, createServiceDto);
  }

  // PATCH /api/services/:serviceId
  @UseGuards(AuthGuard('jwt'))
  @Patch('services/:serviceId')
  update(
    @Param('serviceId') serviceId: string,
    @GetUser() user: User,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(user.id, serviceId, updateServiceDto);
  }

  // DELETE /api/services/:serviceId
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('services/:serviceId')
  remove(@Param('serviceId') serviceId: string, @GetUser() user: User) {
    return this.servicesService.remove(user.id, serviceId);
  }
}