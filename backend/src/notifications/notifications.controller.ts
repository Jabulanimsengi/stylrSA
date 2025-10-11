import {
  Controller,
  Get,
  UseGuards,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';

@Controller('api/notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(
    @GetUser() user: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? Number.parseInt(limit, 10) : undefined;
    return this.notificationsService.getNotifications(user.id, {
      cursor,
      limit: Number.isNaN(parsedLimit) ? undefined : parsedLimit,
    });
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @GetUser() user: any) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Patch('read-all')
  markAllAsRead(@GetUser() user: any) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteNotification(@Param('id') id: string, @GetUser() user: any) {
    return this.notificationsService.deleteNotification(id, user.id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  clearAll(@GetUser() user: any) {
    return this.notificationsService.clearAll(user.id);
  }
}
