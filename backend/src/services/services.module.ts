import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PrismaModule, NotificationsModule, EventsModule],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
