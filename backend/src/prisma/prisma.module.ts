// backend/src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Makes the module global
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Export for other modules to use
})
export class PrismaModule {}
