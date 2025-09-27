// backend/src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        participants: { some: { id: userId } },
      },
      include: {
        participants: {
          select: { id: true, firstName: true, lastName: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get only the last message for the preview
        },
      },
    });
  }

  async getMessages(conversationId: string, userId: string) {
    // Verify user is part of the conversation
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, participants: { some: { id: userId } } },
    });
    if (!conversation) return null;

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }
}