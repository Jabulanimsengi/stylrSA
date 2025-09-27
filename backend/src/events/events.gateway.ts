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
    // This is simplified; a robust solution would handle multiple sockets per user
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
        participants: { every: { id: { in: [senderId, payload.recipientId] } } },
      },
    });
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          participants: {
            connect: [{ id: senderId }, { id: payload.recipientId }],
          },
        },
      });
    }
    const newMessage = await this.prisma.message.create({
      data: {
        body: payload.body,
        senderId: senderId,
        conversationId: conversation.id,
      },
    });
    // Send the new message to the recipient if they are connected
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