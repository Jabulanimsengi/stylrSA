import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrendDto, UpdateTrendDto } from './dto';
import { TrendCategory } from '@prisma/client';

@Injectable()
export class TrendsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new trend (Admin only)
   */
  async create(user: any, dto: CreateTrendDto) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can create trends');
    }

    return this.prisma.trend.create({
      data: {
        ...dto,
        createdBy: user.id,
      },
      include: {
        likes: true,
      },
    });
  }

  /**
   * Get all active trends grouped by category (Public)
   */
  async findAllActive() {
    const trends = await this.prisma.trend.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            likes: true,
            views: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    // Group by category
    const grouped = trends.reduce((acc, trend) => {
      const category = trend.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        ...trend,
        likeCount: trend._count.likes,
        viewCount: trend._count.views,
      });
      return acc;
    }, {} as Record<TrendCategory, any[]>);

    return grouped;
  }

  /**
   * Get all trends by category (Public)
   */
  async findByCategory(category: TrendCategory, userId?: string) {
    const trends = await this.prisma.trend.findMany({
      where: {
        category,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            likes: true,
            views: true,
          },
        },
        likes: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return trends.map((trend) => ({
      ...trend,
      likeCount: trend._count.likes,
      viewCount: trend._count.views,
      isLiked: userId && trend.likes && trend.likes.length > 0,
    }));
  }

  /**
   * Get single trend by ID (Public)
   */
  async findOne(id: string, userId?: string, ipAddress?: string) {
    const trend = await this.prisma.trend.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            likes: true,
            views: true,
          },
        },
        likes: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
    });

    if (!trend) {
      throw new NotFoundException('Trend not found');
    }

    // Track view
    await this.trackView(id, userId, ipAddress);

    return {
      ...trend,
      likeCount: trend._count.likes,
      viewCount: trend._count.views,
      isLiked: userId && trend.likes && trend.likes.length > 0,
    };
  }

  /**
   * Update trend (Admin only)
   */
  async update(user: any, id: string, dto: UpdateTrendDto) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update trends');
    }

    const trend = await this.prisma.trend.findUnique({ where: { id } });
    if (!trend) {
      throw new NotFoundException('Trend not found');
    }

    return this.prisma.trend.update({
      where: { id },
      data: dto,
      include: {
        _count: {
          select: {
            likes: true,
            views: true,
          },
        },
      },
    });
  }

  /**
   * Delete trend (Admin only)
   */
  async delete(user: any, id: string) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can delete trends');
    }

    const trend = await this.prisma.trend.findUnique({ where: { id } });
    if (!trend) {
      throw new NotFoundException('Trend not found');
    }

    await this.prisma.trend.delete({ where: { id } });

    return { message: 'Trend deleted successfully' };
  }

  /**
   * Get all trends for admin management
   */
  async findAllForAdmin() {
    return this.prisma.trend.findMany({
      include: {
        _count: {
          select: {
            likes: true,
            views: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  /**
   * Like a trend
   */
  async like(userId: string, trendId: string) {
    const trend = await this.prisma.trend.findUnique({ where: { id: trendId } });
    if (!trend) {
      throw new NotFoundException('Trend not found');
    }

    // Check if already liked
    const existingLike = await this.prisma.trendLike.findUnique({
      where: {
        userId_trendId: {
          userId,
          trendId,
        },
      },
    });

    if (existingLike) {
      throw new BadRequestException('You have already liked this trend');
    }

    // Create like
    await this.prisma.trendLike.create({
      data: {
        userId,
        trendId,
      },
    });

    // Increment like count
    await this.prisma.trend.update({
      where: { id: trendId },
      data: {
        likeCount: {
          increment: 1,
        },
      },
    });

    return { message: 'Trend liked successfully' };
  }

  /**
   * Unlike a trend
   */
  async unlike(userId: string, trendId: string) {
    const trend = await this.prisma.trend.findUnique({ where: { id: trendId } });
    if (!trend) {
      throw new NotFoundException('Trend not found');
    }

    const existingLike = await this.prisma.trendLike.findUnique({
      where: {
        userId_trendId: {
          userId,
          trendId,
        },
      },
    });

    if (!existingLike) {
      throw new BadRequestException('You have not liked this trend');
    }

    // Delete like
    await this.prisma.trendLike.delete({
      where: {
        userId_trendId: {
          userId,
          trendId,
        },
      },
    });

    // Decrement like count
    await this.prisma.trend.update({
      where: { id: trendId },
      data: {
        likeCount: {
          decrement: 1,
        },
      },
    });

    return { message: 'Trend unliked successfully' };
  }

  /**
   * Get user's liked trends
   */
  async getUserLikes(userId: string) {
    const likes = await this.prisma.trendLike.findMany({
      where: { userId },
      include: {
        trend: {
          include: {
            _count: {
              select: {
                likes: true,
                views: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return likes.map((like) => ({
      ...like.trend,
      likeCount: like.trend._count.likes,
      viewCount: like.trend._count.views,
      isLiked: true,
    }));
  }

  /**
   * Track trend view
   */
  private async trackView(trendId: string, userId?: string, ipAddress?: string) {
    try {
      await this.prisma.trendView.create({
        data: {
          trendId,
          userId,
          ipAddress,
        },
      });

      // Increment view count
      await this.prisma.trend.update({
        where: { id: trendId },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      // Silently fail view tracking to not disrupt user experience
      console.error('Failed to track view:', error);
    }
  }

  /**
   * Track click-through (when user clicks "Find Salons")
   */
  async trackClickThrough(trendId: string) {
    try {
      await this.prisma.trend.update({
        where: { id: trendId },
        data: {
          clickThroughCount: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      console.error('Failed to track click-through:', error);
    }
  }
}
