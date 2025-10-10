// backend/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // Index signature to avoid TS errors if Prisma Client types are out of date
  // and to permit access to dynamic model properties and raw helpers.
  [key: string]: any;
  async onModuleInit() {
    await this.$connect();
  }
}
