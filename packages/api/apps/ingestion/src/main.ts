import { NestFactory } from '@nestjs/core';
import { IngestionModule } from './ingestion.module';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { RmqService } from '@app/common/rmq';

async function bootstrap() {
  const app = await NestFactory.create(IngestionModule, {
    bufferLogs: true,
    cors: true,
  });

  const configService = app.get(ConfigService);
  const rmqService = app.get<RmqService>(RmqService);
  const logger = app.get(Logger);
  const frontendUrl = configService.get<string>(
    'ALLOWED_ORIGINS',
    'http://localhost:3000',
  );

  app.useLogger(logger);
  app.use(cookieParser());
  app.use(compression());
  app.use(helmet());

  app.enableCors({
    origin: [frontendUrl],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const queueName = configService.get<string>(
    'INGESTION_QUEUE_NAME',
    'INGESTION_QUEUE',
  );

  app.connectMicroservice(rmqService.getOptions(queueName));

  logger.log('Starting ingestion microservice');
  await app.startAllMicroservices();

  const port = configService.get<number>('HTTP_PORT', 3002);
  await app.listen(port);

  logger.log(`Ingestion service running on HTTP port ${port}`);
  logger.log('RabbitMQ microservice is listening for messages');
}

bootstrap().catch((error) => {
  console.error('Failed to start ingestion service:', error);
  process.exit(1);
});
