import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add helmet as a middleware
  app.use(helmet());

  app.use(cookieParser());
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
bootstrap();
