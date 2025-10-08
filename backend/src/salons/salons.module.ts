import { Module } from '@nestjs/common';
import { SalonsController } from './salons.controller';
import { SalonsService } from './salons.service';
import { EventsModule } from 'src/events/events.module';
import { ServicesModule } from 'src/services/services.module'; // <-- Import ServicesModule

@Module({
  imports: [EventsModule, ServicesModule], // <-- Add ServicesModule here
  controllers: [SalonsController],
  providers: [SalonsService],
})
export class SalonsModule {}
