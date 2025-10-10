import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    message: string,
    options?: { link?: string; bookingId?: string },
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        message,
        link: options?.link,
        bookingId: options?.bookingId,
      },
    });
  }

  async getNotifications(
    userId: string,
    options?: { cursor?: string; limit?: number },
  ) {
    const resolvedLimit = Math.min(
      Math.max(options?.limit ?? DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    );

    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: resolvedLimit + 1,
      cursor: options?.cursor ? { id: options.cursor } : undefined,
      skip: options?.cursor ? 1 : 0,
    });

    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    const hasNextPage = notifications.length > resolvedLimit;
    const items = hasNextPage
      ? notifications.slice(0, resolvedLimit)
      : notifications;
    const nextCursor =
      hasNextPage && items.length > 0 ? items[items.length - 1].id : null;

    return {
      items,
      nextCursor,
      unreadCount,
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId: userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async clearAll(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification || notification.userId !== userId) {
      throw new ForbiddenException('Cannot delete this notification.');
    }
    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }
}
