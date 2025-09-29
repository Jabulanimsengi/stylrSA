import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private prisma: PrismaService) {}
  private connectedUsers: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(userId, client.id);
      client.join(userId);
    }
  }

  handleDisconnect(client: Socket) {
    for (let [key, value] of this.connectedUsers.entries()) {
      if (value === client.id) {
        this.connectedUsers.delete(key);
        break;
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: { recipientId: string; body: string; }): Promise<void> {
    const senderId = client.handshake.query.userId as string;
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { user1Id: senderId },
          { user2Id: payload.recipientId },
        ],
      },
    });

    if(!conversation) {
      conversation = await this.prisma.conversation.findFirst({
        where: {
          AND: [
            { user1Id: payload.recipientId },
            { user2Id: senderId },
          ],
        },
      });
    }

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          user1Id: senderId,
          user2Id: payload.recipientId
        },
      });
    }
    const newMessage = await this.prisma.message.create({
      data: {
        content: payload.body,
        senderId: senderId,
        conversationId: conversation.id,
      },
    });
    this.server.to(payload.recipientId).emit('newMessage', newMessage);
  }

  @SubscribeMessage('joinSalonRoom')
  handleJoinSalonRoom(client: Socket, salonId: string): void {
    client.join(`salon-${salonId}`);
  }

  @SubscribeMessage('leaveSalonRoom')
  handleLeaveSalonRoom(client: Socket, salonId: string): void {
    client.leave(`salon-${salonId}`);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(userId).emit(event, data);
  }

  emitToSalonRoom(salonId: string, event: string, data: any) {
    this.server.to(`salon-${salonId}`).emit(event, data);
  }
}