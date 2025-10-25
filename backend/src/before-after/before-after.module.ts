import { Module } from '@nestjs/common';
import { BeforeAfterController } from './before-after.controller';
import { BeforeAfterService } from './before-after.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [CloudinaryModule, NotificationsModule],
  controllers: [BeforeAfterController],
  providers: [BeforeAfterService],
  exports: [BeforeAfterService],
})
export class BeforeAfterModule {}
