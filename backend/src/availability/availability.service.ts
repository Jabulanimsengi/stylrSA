// backend/src/availability/availability.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get availability for a specific salon and date
   */
  async getAvailabilityForDate(salonId: string, date: Date) {
    // Normalize date to start of day in UTC for consistent storage
    // Extract local date components and create UTC date to ensure same calendar day
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

    const availability = await this.prisma.serviceProviderAvailability.findMany({
      where: {
        salonId,
        date: startOfDay,
      },
      orderBy: {
        hour: 'asc',
      },
    });

    // Return all 24 hours with availability status
    const hourlyAvailability = Array.from({ length: 24 }, (_, hour) => {
      const record = availability.find((a) => a.hour === hour);
      return {
        hour,
        isAvailable: record ? record.isAvailable : true, // Default to available
      };
    });

    return {
      date: startOfDay,
      slots: hourlyAvailability,
    };
  }

  /**
   * Get availability for a salon for an entire month
   */
  async getAvailabilityForMonth(salonId: string, year: number, month: number) {
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const availability = await this.prisma.serviceProviderAvailability.findMany({
      where: {
        salonId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: [{ date: 'asc' }, { hour: 'asc' }],
    });

    // Group by date
    const grouped = availability.reduce((acc, record) => {
      const dateKey = record.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push({
        hour: record.hour,
        isAvailable: record.isAvailable,
      });
      return acc;
    }, {} as Record<string, Array<{ hour: number; isAvailable: boolean }>>);

    return grouped;
  }

  /**
   * Update availability for specific hours
   */
  async updateAvailability(
    salonId: string,
    date: Date,
    hours: Array<{ hour: number; isAvailable: boolean }>,
    userId: string,
  ) {
    // Verify that the user owns this salon
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
      select: { ownerId: true },
    });

    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    if (salon.ownerId !== userId) {
      throw new ForbiddenException('You do not own this salon');
    }

    // Normalize date to start of day in UTC for consistent storage
    // Extract date components to avoid timezone issues
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

    // Use transaction to update all hours at once
    const updates = hours.map((slot) =>
      this.prisma.serviceProviderAvailability.upsert({
        where: {
          salonId_date_hour: {
            salonId,
            date: startOfDay,
            hour: slot.hour,
          },
        },
        update: {
          isAvailable: slot.isAvailable,
        },
        create: {
          salonId,
          date: startOfDay,
          hour: slot.hour,
          isAvailable: slot.isAvailable,
        },
      }),
    );

    await this.prisma.$transaction(updates);

    return { success: true, updated: hours.length };
  }

  /**
   * Check if a salon is available at a specific date and hour
   */
  async isAvailable(salonId: string, date: Date, hour: number): Promise<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const record = await this.prisma.serviceProviderAvailability.findUnique({
      where: {
        salonId_date_hour: {
          salonId,
          date: startOfDay,
          hour,
        },
      },
    });

    // If no record exists, default to available (based on operating hours)
    return record ? record.isAvailable : true;
  }

  /**
   * Delete old availability records (older than 90 days)
   */
  async cleanupOldRecords() {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    ninetyDaysAgo.setUTCHours(0, 0, 0, 0);

    const result = await this.prisma.serviceProviderAvailability.deleteMany({
      where: {
        date: {
          lt: ninetyDaysAgo,
        },
      },
    });

    return result;
  }
}

