// backend/src/cloudinary/cloudinary.module.ts
import { Module } from '@nestjs/common';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';

@Module({
  controllers: [CloudinaryController],
  providers: [CloudinaryService],
  exports: [CloudinaryService], // Export so other modules can use it
})
export class CloudinaryModule {}
