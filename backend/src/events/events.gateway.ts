// backend/src/events/events.gateway.ts
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

  // We inject PrismaService to save messages
  constructor(private prisma: PrismaService) {}

  private connectedUsers: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(userId, client.id);
      client.join(userId); // Have the user join a room named after their ID
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.delete(userId);
    }
  }

  // This handles an incoming 'sendMessage' event from a client
  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: {
    recipientId: string;
    body: string;
  }): Promise<void> {
    const senderId = client.handshake.query.userId as string;

    // Find or create conversation between sender and recipient
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

    // Save the new message to the database
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

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(userId).emit(event, data);
  }
}