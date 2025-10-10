import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateConversation(userOneId: string, userTwoId: string) {
    if (userOneId === userTwoId) {
      throw new Error('Cannot create a conversation with oneself.');
    }

    // Check if a conversation between these two specific users already exists
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        OR: [
          { AND: [{ user1Id: userOneId }, { user2Id: userTwoId }] },
          { AND: [{ user1Id: userTwoId }, { user2Id: userOneId }] },
        ],
      },
    });

    // If no conversation is found, create a new one
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          user1Id: userOneId,
          user2Id: userTwoId,
        },
      });
    }
    return conversation;
  }

  async getConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            deliveredAt: true,
            readAt: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return Promise.all(
      conversations.map(async (conversation) => {
        const [latest] = conversation.messages;
        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: userId },
            readAt: null,
          },
        });

        const { messages, ...rest } = conversation;
        return {
          ...rest,
          participants: [conversation.user1, conversation.user2],
          lastMessage: latest
            ? {
                ...latest,
                createdAt: latest.createdAt.toISOString(),
                deliveredAt: latest.deliveredAt
                  ? latest.deliveredAt.toISOString()
                  : null,
                readAt: latest.readAt ? latest.readAt.toISOString() : null,
              }
            : null,
          unreadCount,
        };
      }),
    );
  }

  async getConversationById(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          select: { id: true, firstName: true, lastName: true },
        },
        user2: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
    if (!conversation) {
      throw new UnauthorizedException(
        "Conversation not found or you're not a participant.",
      );
    }
    return conversation;
  }

  async getMessages(conversationId: string, userId: string) {
    // Verify user is part of the conversation to ensure privacy
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });

    if (!conversation) {
      throw new UnauthorizedException('You are not part of this conversation.');
    }

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
