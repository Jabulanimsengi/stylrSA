import { Module } from '@nestjs/common';
import { Top10RequestsController } from './top10-requests.controller';
import { Top10RequestsService } from './top10-requests.service';
import { PrismaModule } from '../prisma/prisma.module';

import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [Top10RequestsController],
  providers: [Top10RequestsService],
  exports: [Top10RequestsService],
})
export class Top10RequestsModule { }
