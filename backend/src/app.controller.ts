// backend/src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MongoService } from './mongo/mongo.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mongoService: MongoService,
  ) {}

  @Get('api/health')
  getHealthCheck(): { status: string } {
    return { status: 'Backend is running! 🚀' };
  }

  @Get('api/health/mongo')
  async getMongoHealth(): Promise<{ status: string; message: string }> {
    const health = await this.mongoService.healthCheck();
    return {
      status: health.ok ? 'ok' : 'error',
      message:
        health.message + (health.database ? ` (db: ${health.database})` : ''),
    };
  }
}
