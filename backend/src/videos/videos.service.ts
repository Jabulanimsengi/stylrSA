import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VimeoService } from './vimeo.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class VideosService {
  constructor(
    private prisma: PrismaService,
    private vimeo: VimeoService,
    private notifications: NotificationsService,
  ) {}

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
    // Note: This is a basic check. In production, you'd use a library like fluent-ffmpeg
    // to get the actual video duration before upload
    if (file.size > 50 * 1024 * 1024) { // 50MB max
      throw new BadRequestException('Video file size must be less than 50MB');
    }

    // Upload to Vimeo
    const vimeoUpload = await this.vimeo.uploadVideo(file, {
      name: caption || `Service video - ${salon.name}`,
      description: caption,
    });

    // Get video duration from Vimeo
    const videoDetails = await this.vimeo.getVideoDetails(vimeoUpload.videoId);

    if (videoDetails.duration > 60) {
      // Delete from Vimeo if exceeds 60 seconds
      await this.vimeo.deleteVideo(vimeoUpload.videoId);
      throw new BadRequestException('Video duration must be 60 seconds or less');
    }

    // Create video record
    const video = await this.prisma.serviceVideo.create({
      data: {
        videoUrl: vimeoUpload.videoUrl,
        vimeoId: vimeoUpload.videoId,
        thumbnailUrl: videoDetails.thumbnailUrl,
        duration: videoDetails.duration,
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
          { link: `/admin/videos-pending` },
        ),
      ),
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
          select: { id: true, name: true, city: true, province: true },
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

    // Delete from Vimeo
    await this.vimeo.deleteVideo(video.vimeoId);

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
