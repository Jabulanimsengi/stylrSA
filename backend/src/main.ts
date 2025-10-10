import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security & performance middlewares
  const helmetMw = (helmet as unknown as () => any)();
  const compressionMw = (compression as unknown as () => any)();
  const cookieMw = (cookieParser as unknown as () => any)();
  app.use(helmetMw);
  app.use(compressionMw);
  app.use(cookieMw);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  const allowedOrigins = (
    process.env.CORS_ORIGIN || 'http://localhost:3001'
  ).split(',');
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  await app.listen(3000);
}
void bootstrap();
