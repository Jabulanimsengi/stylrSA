import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class VideosService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private notifications: NotificationsService,
    private mailService: MailService,
  ) { }

  async uploadVideo(
    file: Express.Multer.File,
    salonId: string,
    serviceId: string | undefined,
    caption: string | undefined,
    userId: string,
  ) {
    // Verify salon ownership
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
      select: {
        id: true,
        ownerId: true,
        planCode: true,
        name: true,
      },
    });

    if (!salon || salon.ownerId !== userId) {
      throw new ForbiddenException('You do not own this salon');
    }

    // Check plan eligibility (Growth, Pro, Elite only)
    const allowedPlans = ['GROWTH', 'PRO', 'ELITE'];
    if (!salon.planCode || !allowedPlans.includes(salon.planCode)) {
      throw new ForbiddenException(
        'Video uploads are only available for Growth, Pro, and Elite plans. Please upgrade your plan.',
      );
    }

    // Validate video duration (max 60 seconds)
    // Basic check happens in frontend, Cloudinary returns duration.

    // Upload to Cloudinary
    let videoData;
    try {
      const result = await this.cloudinary.uploadVideo(file);
      videoData = {
        videoUrl: result.secure_url,
        videoId: result.public_id, // Storing Cloudinary public_id in vimeoId column
        thumbnailUrl: result.secure_url.replace(/\.[^/.]+$/, ".jpg"),
        duration: result.duration || 0,
      };
    } catch (error) {
      throw new BadRequestException('Failed to upload video');
    }

    // Create video record
    const video = await this.prisma.serviceVideo.create({
      data: {
        videoUrl: videoData.videoUrl,
        vimeoId: videoData.videoId,
        thumbnailUrl: videoData.thumbnailUrl,
        duration: videoData.duration,
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
      'Your video has been submitted and is awaiting admin approval.',
      { link: `/dashboard/my-videos` },
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
          `New video uploaded by ${video.salon.name} awaiting review.`,
          { link: `/admin?tab=media` },
        ),
      ),
    );

    // Send admin email notification
    const uploader = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    });
    await this.mailService.notifyAdminNewVideo(
      video.salon.name,
      caption || 'Service Video',
      uploader ? `${uploader.firstName} ${uploader.lastName} (${uploader.email})` : userId,
    );

    return {
      message: 'Video uploaded successfully. Awaiting approval.',
      video,
    };
  }

  async getApprovedVideos(limit: number = 20, salonId?: string) {
    const where: any = { approvalStatus: 'APPROVED' };
    if (salonId) {
      where.salonId = salonId;
    }

    return this.prisma.serviceVideo.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        salon: {
          select: { id: true, name: true, slug: true, city: true, province: true },
        },
        service: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async getVideosBySalonOwner(userId: string) {
    const salons = await this.prisma.salon.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });

    const salonIds = salons.map((s) => s.id);

    return this.prisma.serviceVideo.findMany({
      where: { salonId: { in: salonIds } },
      orderBy: { createdAt: 'desc' },
      include: {
        salon: {
          select: { id: true, name: true, planCode: true },
        },
        service: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async deleteVideo(id: string, userId: string) {
    const video = await this.prisma.serviceVideo.findUnique({
      where: { id },
      include: { salon: true },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    if (video.salon.ownerId !== userId) {
      throw new ForbiddenException('You do not own this video');
    }

    // Delete from Cloudinary (using vimeoId column which now holds public_id)
    await this.cloudinary.deleteVideo(video.vimeoId);

    // Delete from database
    await this.prisma.serviceVideo.delete({ where: { id } });

    return { message: 'Video deleted successfully' };
  }

  async incrementViews(id: string) {
    const video = await this.prisma.serviceVideo.update({
      where: { id },
      data: { views: { increment: 1 } },
      select: { views: true },
    });

    return { views: video.views };
  }

  async getPendingVideos() {
    return this.prisma.serviceVideo.findMany({
      where: { approvalStatus: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: {
        salon: {
          select: { id: true, name: true, city: true, province: true, planCode: true },
        },
        service: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async approveVideo(id: string, adminId: string) {
    const video = await this.prisma.serviceVideo.update({
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
      video.salon.ownerId,
      `Your video has been approved! It is now visible to clients.`,
      { link: `/dashboard/my-videos` },
    );

    return {
      message: 'Video approved successfully',
      video,
    };
  }

  async rejectVideo(id: string, adminId: string, reason?: string) {
    const video = await this.prisma.serviceVideo.update({
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
      video.salon.ownerId,
      `Your video was rejected. Reason: ${video.rejectionReason}`,
      { link: `/dashboard/my-videos` },
    );

    return {
      message: 'Video rejected',
      video,
    };
  }
}
