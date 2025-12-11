import { Module } from '@nestjs/common';
import { BeforeAfterController } from './before-after.controller';
import { BeforeAfterService } from './before-after.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [CloudinaryModule, NotificationsModule, MailModule],
  controllers: [BeforeAfterController],
  providers: [BeforeAfterService],
  exports: [BeforeAfterService],
})
export class BeforeAfterModule { }
