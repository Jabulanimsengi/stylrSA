import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController, PublicServicesController } from './services.controller';

@Module({
  controllers: [ServicesController, PublicServicesController],
  providers: [ServicesService],
  exports: [ServicesService], // <-- Add this line to export the service
})
export class ServicesModule {}