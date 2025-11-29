import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/health')
  async getHealth() {
    let database = 'ok';
    try {
      // Simple query to check database connection
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      database = 'error';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database,
      uptime: process.uptime(),
    };
  }
}
