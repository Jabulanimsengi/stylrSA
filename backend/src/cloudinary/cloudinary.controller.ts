// backend/src/cloudinary/cloudinary.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('signature')
  getSignature() {
    return this.cloudinaryService.getSignature();
  }
}
