// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // Import ValidationPipe

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add this line to enable validation globally
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.enableCors(); // Enable Cross-Origin Resource Sharing
  await app.listen(3000);
}
bootstrap();