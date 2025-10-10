import {
  Controller,
  Get,
  UseGuards,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User } from '@prisma/client';

@Controller('api/notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(@GetUser() user: User) {
    return this.notificationsService.getNotifications(user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @GetUser() user: User) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Patch('read-all')
  markAllAsRead(@GetUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteNotification(@Param('id') id: string, @GetUser() user: User) {
    return this.notificationsService.deleteNotification(id, user.id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  clearAll(@GetUser() user: User) {
    return this.notificationsService.clearAll(user.id);
  }
}
