import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateConversation(userOneId: string, userTwoId: string) {
    if (userOneId === userTwoId) {
      throw new Error("Cannot create a conversation with oneself.");
    }

    // Check if a conversation between these two specific users already exists
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { user1Id: userOneId },
          { user2Id: userTwoId },
        ],
      },
    });

    if(!conversation) {
      conversation = await this.prisma.conversation.findFirst({
        where: {
          AND: [
            { user1Id: userTwoId },
            { user2Id: userOneId },
          ],
        },
      });
    }


    // If no conversation is found, create a new one
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          user1Id: userOneId,
          user2Id: userTwoId
        },
      });
    }
    return conversation;
  }

  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ]
      },
      include: {
        user1: {
          select: { id: true, firstName: true, lastName: true },
        },
        user2: {
          select: { id: true, firstName: true, lastName: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get only the last message for the preview
        },
      },
      orderBy: {
        updatedAt: 'desc',
      }
    });
  }

  async getConversationById(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ]
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
      throw new UnauthorizedException("Conversation not found or you're not a participant.");
    }
    return conversation;
  }

  async getMessages(conversationId: string, userId: string) {
    // Verify user is part of the conversation to ensure privacy
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ]
      },
    });

    if (!conversation) {
      throw new UnauthorizedException("You are not part of this conversation.");
    }

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }
}