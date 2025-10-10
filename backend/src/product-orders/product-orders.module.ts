import { Module } from '@nestjs/common';
import { ProductOrdersController } from './product-orders.controller';
import { ProductOrdersService } from './product-orders.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [PrismaModule, NotificationsModule, EventsModule],
  controllers: [ProductOrdersController],
  providers: [ProductOrdersService],
  exports: [ProductOrdersService],
})
export class ProductOrdersModule {}
