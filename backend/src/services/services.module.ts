// backend/src/services/services.module.ts
import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController, PublicServicesController } from './services.controller';

@Module({
  controllers: [ServicesController, PublicServicesController], // Add PublicServicesController
  providers: [ServicesService],
})
export class ServicesModule {}