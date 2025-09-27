// backend/src/events/events.module.ts
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { PrismaModule } from 'src/prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [PrismaModule], // Add it here
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}