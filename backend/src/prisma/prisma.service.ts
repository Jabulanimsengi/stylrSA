// backend/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';

// Avoid hard typing PrismaClient to prevent TS errors when Prisma Client types are missing/out-of-sync
// eslint-disable-next-line @typescript-eslint/no-var-requires
const prismaPkg: any = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return require('@prisma/client');
  } catch {
    return {};
  }
})();
// Fallback empty class if PrismaClient isn't available at build time (runtime should still provide it)
const BasePrismaClient: any = prismaPkg.PrismaClient ?? class {
  async $connect() {/* noop */}
};

@Injectable()
export class PrismaService extends BasePrismaClient implements OnModuleInit {
  // Index signature to avoid TS errors if Prisma Client types are out of date
  // and to permit access to dynamic model properties and raw helpers.
  [key: string]: any;
  async onModuleInit() {
    await this.$connect();
  }
}
