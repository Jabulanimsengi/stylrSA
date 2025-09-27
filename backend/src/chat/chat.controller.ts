// backend/src/chat/chat.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User } from '@prisma/client';

@Controller('api/chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  getConversations(@GetUser() user: User) {
    return this.chatService.getConversations(user.id);
  }

  @Get('conversations/:id')
  getMessages(@Param('id') id: string, @GetUser() user: User) {
    return this.chatService.getMessages(id, user.id);
  }
}