import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { VimeoService } from './vimeo.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [VideosController],
  providers: [VideosService, VimeoService],
  exports: [VideosService, VimeoService],
})
export class VideosModule {}
