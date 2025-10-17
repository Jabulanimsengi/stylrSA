import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// Use CommonJS requires for CJS middlewares to avoid default interop issues at runtime
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieParser = require('cookie-parser');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const helmet = require('helmet');
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const compression = require('compression');
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ensure Socket.IO gateway is attached to the underlying HTTP server
  app.useWebSocketAdapter(new IoAdapter(app));

  // Security & performance middlewares
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  const allowedOrigins = (
    process.env.CORS_ORIGIN || 'http://localhost:3001,http://localhost:3000'
  ).split(',');
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
