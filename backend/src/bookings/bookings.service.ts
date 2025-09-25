// backend/src/bookings/bookings.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookingDto } from '../../dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(clientId: string, dto: CreateBookingDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
      include: { salon: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found.');
    }

    let totalCost = service.price;
    if (dto.isMobile) {
      if (!service.salon.offersMobile || service.salon.mobileFee === null) {
        throw new Error('This salon does not offer mobile services.');
      }
      totalCost += service.salon.mobileFee;
    }

    return this.prisma.booking.create({
      data: {
        userId: clientId,
        salonId: service.salonId,
        serviceId: dto.serviceId,
        bookingDate: new Date(dto.bookingDate),
        isMobile: dto.isMobile,
        totalCost: totalCost,
      },
    });
  }
}