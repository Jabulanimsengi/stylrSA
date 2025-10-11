import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');
  private connectedUsers: Map<string, Set<string>> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    const userId = this.extractUserId(client);
    if (userId) {
      this.registerUserSocket(userId, client.id);
      void client.join(`user:${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    for (const [userId, sockets] of this.connectedUsers.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.connectedUsers.delete(userId);
        }
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!userId) {
      return;
    }
    this.registerUserSocket(userId, client.id);
    void client.join(`user:${userId}`);
    this.logger.log(`User ${userId} registered with socket id ${client.id}`);
  }

  @SubscribeMessage('conversation:join')
  handleConversationJoin(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!conversationId) {
      return;
    }
    void client.join(this.getConversationRoom(conversationId));
  }

  @SubscribeMessage('conversation:leave')
  handleConversationLeave(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!conversationId) {
      return;
    }
    void client.leave(this.getConversationRoom(conversationId));
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    payload: {
      conversationId: string;
      recipientId: string;
      body: string;
      tempId?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = this.getUserIdFromSocket(client);
    if (!senderId) {
      client.emit('message:error', {
        tempId: payload.tempId,
        error: 'Unauthorized socket client',
      });
      return;
    }

    const { conversationId, recipientId, body, tempId } = payload;
    if (!conversationId || !recipientId || !body.trim()) {
      client.emit('message:error', {
        tempId,
        error: 'Invalid message payload',
      });
      return;
    }

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, user1Id: true, user2Id: true },
    });

    if (
      !conversation ||
      (conversation.user1Id !== senderId && conversation.user2Id !== senderId)
    ) {
      client.emit('message:error', {
        tempId,
        error: 'You are not part of this conversation',
      });
      return;
    }

    let message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: body,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    const recipientNotificationPromise = (async () => {
      try {
        if (recipientId !== senderId) {
          const senderProfile = await this.prisma.user.findUnique({
            where: { id: senderId },
            select: { firstName: true, lastName: true },
          });
          const senderName = senderProfile
            ? `${senderProfile.firstName ?? ''} ${senderProfile.lastName ?? ''}`.trim() ||
              'A user'
            : 'A user';
          const notification = await this.notificationsService.create(
            recipientId,
            `New message from ${senderName}.`,
            { link: `/chat/${conversationId}` },
          );
          this.sendNotificationToUser(
            recipientId,
            'newNotification',
            notification,
          );
        }
      } catch (error) {
        this.logger.error(
          'Failed to enqueue chat notification',
          error instanceof Error ? error.stack : String(error),
        );
      }
    })();

    const serialized = this.serializeMessage(message);

    client.emit('message:sent', { message: serialized, tempId });

    const recipientSockets = this.connectedUsers.get(recipientId);
    if (recipientSockets && recipientSockets.size > 0) {
      const deliveredAt = new Date();
      message = await this.prisma.message.update({
        where: { id: message.id },
        data: {
          deliveredAt,
        },
      });
      const deliveredPayload = this.serializeMessage(message);
      this.emitToUser(recipientId, 'message:new', deliveredPayload);
      client.emit('message:delivered', deliveredPayload);
    }

    await recipientNotificationPromise;
  }

  @SubscribeMessage('conversation:read')
  async handleConversationRead(
    @MessageBody() payload: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const readerId = this.getUserIdFromSocket(client);
    if (!readerId) {
      return;
    }

    const { conversationId } = payload;
    if (!conversationId) {
      return;
    }

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { user1Id: true, user2Id: true },
    });

    if (
      !conversation ||
      (conversation.user1Id !== readerId && conversation.user2Id !== readerId)
    ) {
      return;
    }

    const pendingMessages = await this.prisma.message.findMany({
      where: {
        conversationId,
        senderId: { not: readerId },
        readAt: null,
      },
      select: { id: true },
    });

    if (pendingMessages.length === 0) {
      client.emit('conversation:read', {
        conversationId,
        updates: [],
      });
      return;
    }

    const readAt = new Date();
    const ids = pendingMessages.map((message) => message.id);

    await this.prisma.message.updateMany({
      where: { id: { in: ids } },
      data: { isRead: true, readAt },
    });

    const updates = ids.map((id) => ({ id, readAt: readAt.toISOString() }));

    client.emit('conversation:read', {
      conversationId,
      updates,
    });

    const otherUserId =
      conversation.user1Id === readerId
        ? conversation.user2Id
        : conversation.user1Id;

    this.emitToUser(otherUserId, 'conversation:read', {
      conversationId,
      updates,
      readerId,
    });
  }

  // FIX: Reverted method name to 'sendNotificationToUser'
  sendNotificationToUser(userId: string, event: string, data: any) {
    this.emitToUser(userId, event, data);
  }

  private registerUserSocket(userId: string, socketId: string) {
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId)!.add(socketId);
  }

  private extractUserId(client: Socket): string | null {
    const { userId } = client.handshake.query;
    if (typeof userId === 'string' && userId.trim().length > 0) {
      return userId;
    }
    return null;
  }

  private getUserIdFromSocket(client: Socket): string | null {
    const direct = this.extractUserId(client);
    if (direct) {
      return direct;
    }
    for (const [userId, sockets] of this.connectedUsers.entries()) {
      if (sockets.has(client.id)) {
        return userId;
      }
    }
    return null;
  }

  private emitToUser(userId: string, event: string, data: any) {
    const socketIds = this.connectedUsers.get(userId);
    if (!socketIds || socketIds.size === 0) {
      return;
    }
    for (const socketId of socketIds) {
      this.server.to(socketId).emit(event, data);
    }
  }

  private getConversationRoom(conversationId: string) {
    return `conversation:${conversationId}`;
  }

  private serializeMessage(message: any) {
    return {
      ...message,
      createdAt: message.createdAt.toISOString(),
      deliveredAt: message.deliveredAt
        ? message.deliveredAt.toISOString()
        : null,
      readAt: message.readAt ? message.readAt.toISOString() : null,
    };
  }
}
