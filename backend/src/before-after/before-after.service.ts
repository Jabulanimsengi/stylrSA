import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BeforeAfterService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private notifications: NotificationsService,
  ) {}

  async uploadBeforeAfter(
    files: Express.Multer.File[],
    salonId: string,
    serviceId: string | undefined,
    caption: string | undefined,
    userId: string,
  ) {
    // Verify salon ownership
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
    });

    if (!salon || salon.ownerId !== userId) {
      throw new ForbiddenException('You do not own this salon');
    }

    // Upload images to Cloudinary
    const beforeUpload = await this.cloudinary.uploadImage(files[0]);
    const afterUpload = await this.cloudinary.uploadImage(files[1]);

    // Create before/after photo record
    const beforeAfterPhoto = await this.prisma.beforeAfterPhoto.create({
      data: {
        beforeImageUrl: beforeUpload.secure_url,
        afterImageUrl: afterUpload.secure_url,
        caption: caption,
        salonId: salonId,
        serviceId: serviceId || null,
        approvalStatus: 'PENDING',
      },
      include: {
        salon: {
          select: { id: true, name: true, ownerId: true },
        },
        service: {
          select: { id: true, title: true },
        },
      },
    });

    // Notify salon owner
    await this.notifications.create(
      userId,
      'Your before/after photos have been submitted and are awaiting admin approval.',
      { link: `/dashboard/my-before-after` },
    );

    // Notify all admins
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    
    await Promise.all(
      admins.map((admin) =>
        this.notifications.create(
          admin.id,
          `New before/after photos uploaded by ${beforeAfterPhoto.salon.name} awaiting review.`,
          { link: `/admin/before-after-pending` },
        ),
      ),
    );

    return {
      message: 'Before/after photos uploaded successfully. Awaiting approval.',
      photo: beforeAfterPhoto,
    };
  }

  async getApprovedBeforeAfter(limit: number = 20, salonId?: string) {
    const where: any = { approvalStatus: 'APPROVED' };
    if (salonId) {
      where.salonId = salonId;
    }

    return this.prisma.beforeAfterPhoto.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        salon: {
          select: { id: true, name: true, city: true, province: true },
        },
        service: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async getBeforeAfterBySalonOwner(userId: string) {
    const salons = await this.prisma.salon.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });

    const salonIds = salons.map((s) => s.id);

    return this.prisma.beforeAfterPhoto.findMany({
      where: { salonId: { in: salonIds } },
      orderBy: { createdAt: 'desc' },
      include: {
        salon: {
          select: { id: true, name: true },
        },
        service: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async deleteBeforeAfter(id: string, userId: string) {
    const photo = await this.prisma.beforeAfterPhoto.findUnique({
      where: { id },
      include: { salon: true },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (photo.salon.ownerId !== userId) {
      throw new ForbiddenException('You do not own this photo');
    }

    await this.prisma.beforeAfterPhoto.delete({ where: { id } });

    return { message: 'Photo deleted successfully' };
  }

  async getPendingBeforeAfter() {
    return this.prisma.beforeAfterPhoto.findMany({
      where: { approvalStatus: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: {
        salon: {
          select: { id: true, name: true, city: true, province: true },
        },
        service: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async approveBeforeAfter(id: string, adminId: string) {
    const photo = await this.prisma.beforeAfterPhoto.update({
      where: { id },
      data: {
        approvalStatus: 'APPROVED',
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectionReason: null,
      },
      include: {
        salon: {
          select: { id: true, name: true, ownerId: true },
        },
      },
    });

    // Notify salon owner
    await this.notifications.create(
      photo.salon.ownerId,
      `Your before/after photos have been approved! They are now visible to clients.`,
      { link: `/dashboard/my-before-after` },
    );

    return {
      message: 'Before/after photo approved successfully',
      photo,
    };
  }

  async rejectBeforeAfter(id: string, adminId: string, reason?: string) {
    const photo = await this.prisma.beforeAfterPhoto.update({
      where: { id },
      data: {
        approvalStatus: 'REJECTED',
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectionReason: reason || 'Content does not meet our guidelines',
      },
      include: {
        salon: {
          select: { id: true, name: true, ownerId: true },
        },
      },
    });

    // Notify salon owner with rejection reason
    await this.notifications.create(
      photo.salon.ownerId,
      `Your before/after photos were rejected. Reason: ${photo.rejectionReason}`,
      { link: `/dashboard/my-before-after` },
    );

    return {
      message: 'Before/after photo rejected',
      photo,
    };
  }
}
