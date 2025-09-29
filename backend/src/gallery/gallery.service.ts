import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService) {}

  async addImage(userId: string, salonId: string, dto: CreateGalleryImageDto) {
    const salon = await this.prisma.salon.findUnique({ where: { id: salonId } });
    if (!salon) {
      throw new NotFoundException('Salon not found.');
    }
    if (salon.ownerId !== userId) {
      throw new ForbiddenException('You are not authorized to add images to this gallery.');
    }
    return this.prisma.galleryImage.create({
      data: {
        salonId,
        imageUrl: dto.imageUrl,
        caption: dto.caption,
      },
    });
  }

  async getImagesForSalon(salonId: string) {
    return this.prisma.galleryImage.findMany({
      where: { salonId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteImage(userId: string, imageId: string) {
    const image = await this.prisma.galleryImage.findUnique({
      where: { id: imageId },
      include: { salon: true },
    });
    if (!image) {
      throw new NotFoundException('Image not found.');
    }
    if (image.salon.ownerId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this image.');
    }
    await this.prisma.galleryImage.delete({ where: { id: imageId } });
    return { message: 'Image deleted successfully.' };
  }
}