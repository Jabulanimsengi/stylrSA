import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { EventsModule } from 'src/events/events.module';
import { BeforeAfterModule } from 'src/before-after/before-after.module';
import { VideosModule } from 'src/videos/videos.module';

@Module({
  imports: [PrismaModule, NotificationsModule, EventsModule, BeforeAfterModule, VideosModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
