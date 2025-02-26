import { NestFactory } from '@nestjs/core';
import { IngestionModule } from './ingestion.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(IngestionModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL');

  app.useLogger(app.get(Logger));

  app.use(cookieParser());

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const port = configService.get<number>('HTTP_PORT', 3002);
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Ingestion service running on port ${port}`);
}

bootstrap();
