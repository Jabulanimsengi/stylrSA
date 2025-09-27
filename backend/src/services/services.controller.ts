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

// This new controller will handle all public-facing service routes
@Controller('api')
export class PublicServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('salons/:salonId/services')
  findAllForSalon(@Param('salonId') salonId: string) {
    return this.servicesService.findAllForSalon(salonId);
  }

  @Get('services/featured')
  findFeatured() {
    return this.servicesService.findFeatured();
  }
}


@Controller('api/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Patch(':serviceId')
  update(
    @Param('serviceId') serviceId: string,
    @GetUser() user: User,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(user.id, serviceId, updateServiceDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':serviceId')
  remove(@Param('serviceId') serviceId: string, @GetUser() user: User) {
    return this.servicesService.remove(user.id, serviceId);
  }
}