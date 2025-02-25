import { NestFactory } from '@nestjs/core';
import { IngestionModule } from './ingestion.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(IngestionModule);
  const logger = app.get(Logger);
  const configService = app.get(ConfigService);

  const httpPort = configService.get('HTTP_PORT', 3002);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());
  app.enableCors({
    origin: configService.get('FRONTEND_URL'),
    credentials: true,
  });
  app.useLogger(logger);

  await app.startAllMicroservices();
  await app.listen(httpPort);

  logger.log(`server running on port ${httpPort}`);
  logger.log(`node env: ${configService.get('NODE_ENV')}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start auth service:', error);
  process.exit(1);
});
