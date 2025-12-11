import { Module } from '@nestjs/common';
import { SalonsController } from './salons.controller';
import { SalonsService } from './salons.service';
import { EventsModule } from 'src/events/events.module';
import { ServicesModule } from 'src/services/services.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [EventsModule, ServicesModule, NotificationsModule, MailModule],
  controllers: [SalonsController],
  providers: [SalonsService],
})
export class SalonsModule { }
