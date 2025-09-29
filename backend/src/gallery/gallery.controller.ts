import { Controller, Post, Body, UseGuards, Param, Get, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User } from '@prisma/client';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';

@Controller('api/gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  // Get all images for a salon (Public)
  @Get('salon/:salonId')
  getImagesForSalon(@Param('salonId') salonId: string) {
    return this.galleryService.getImagesForSalon(salonId);
  }
  
  // Add an image to a salon's gallery (Salon Owner)
  @UseGuards(AuthGuard('jwt'))
  @Post('salon/:salonId')
  addImage(
    @GetUser() user: User,
    @Param('salonId') salonId: string,
    @Body() dto: CreateGalleryImageDto,
  ) {
    return this.galleryService.addImage(user.id, salonId, dto);
  }
  
  // Delete an image from a gallery (Salon Owner)
  @UseGuards(AuthGuard('jwt'))
  @Delete(':imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteImage(
    @GetUser() user: User,
    @Param('imageId') imageId: string,
  ) {
    return this.galleryService.deleteImage(user.id, imageId);
  }
}