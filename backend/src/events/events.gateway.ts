import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnGatewayInit } from '@nestjs/websockets';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@WebSocketGateway({
  cors: {
    origin: (
      process.env.CORS_ORIGIN || 'http://localhost:3001,http://localhost:3000'
    ).split(','),
    credentials: true,
  },
  maxHttpBufferSize: 1e6, // 1MB max message size
  pingTimeout: 20000, // 20 seconds
  pingInterval: 25000, // 25 seconds
  transports: ['websocket', 'polling'], // Allow fallback
})
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');
  private connectedUsers: Map<string, Set<string>> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  afterInit(server: Server) {
    // Only enable Redis if explicitly configured in production
    const enableRedis = process.env.ENABLE_REDIS_ADAPTER === 'true';
    
    if (enableRedis && process.env.NODE_ENV === 'production') {
      try {
        const url = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING;
        if (url) {
          const pub = new Redis(url);
          const sub = new Redis(url);
          server.adapter(createAdapter(pub as any, sub as any));
          this.logger.log('Socket.IO Redis adapter enabled');
        }
      } catch (err) {
        this.logger.error('Failed to enable Redis adapter for Socket.IO', err instanceof Error ? err.stack : String(err));
      }
    } else {
      this.logger.log('Socket.IO using default in-memory adapter (single instance mode)');
    }

    // Start cleanup interval - remove stale connections every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleConnections();
    }, 5 * 60 * 1000); // 5 minutes
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    const userId = this.extractUserId(client);
    if (userId) {
      this.registerUserSocket(userId, client.id);
      void client.join(`user:${userId}`);
    } else {
      // Optionally disconnect unauthorized sockets if needed
      // client.disconnect();
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
    // 1) Prefer validated JWT from cookie
    try {
      const rawCookie = client.handshake.headers?.cookie;
      const token = this.getCookie(rawCookie, 'access_token');
      if (token) {
        const secret = this.config.get<string>('JWT_SECRET');
        if (secret) {
          const payload = this.jwt.verify(token, { secret });
          if (payload?.sub && typeof payload.sub === 'string') {
            return payload.sub;
          }
        }
      }
    } catch (err) {
      // ignore JWT errors; we'll fallback to query param registration
    }
    // 2) Backward compatibility: allow query.userId provided by client (less secure)
    const { userId } = client.handshake.query;
    if (typeof userId === 'string' && userId.trim().length > 0) {
      return userId;
    }
    return null;
  }

  private getCookie(
    cookieHeader: string | undefined,
    name: string,
  ): string | null {
    if (!cookieHeader) return null;
    const parts = cookieHeader.split(';');
    for (const part of parts) {
      const [k, v] = part.split('=');
      if (k && v && k.trim() === name) {
        try {
          return decodeURIComponent(v.trim());
        } catch {
          return v.trim();
        }
      }
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

  private cleanupStaleConnections() {
    const beforeSize = this.connectedUsers.size;
    const emptyUsers: string[] = [];

    // Find users with no active sockets
    for (const [userId, sockets] of this.connectedUsers.entries()) {
      if (sockets.size === 0) {
        emptyUsers.push(userId);
      }
    }

    // Remove empty entries
    for (const userId of emptyUsers) {
      this.connectedUsers.delete(userId);
    }

    if (emptyUsers.length > 0) {
      this.logger.log(
        `Cleaned up ${emptyUsers.length} stale user connections (${beforeSize} -> ${this.connectedUsers.size})`
      );
    }
  }

  onModuleDestroy() {
    // Clean up interval on shutdown
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
