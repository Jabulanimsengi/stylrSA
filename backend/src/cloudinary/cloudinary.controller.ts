// backend/src/cloudinary/cloudinary.controller.ts
import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('signature')
  getSignature(
    @Query('folder') folder?: string,
    @Query('public_id') publicId?: string,
  ) {
    // Build params object from query parameters
    const params: Record<string, any> = {};
    if (folder) params.folder = folder;
    if (publicId) params.public_id = publicId;
    
    return this.cloudinaryService.getSignature(params);
  }
}
