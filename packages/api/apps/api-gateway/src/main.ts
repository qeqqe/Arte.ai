import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';
import { RmqService } from '@app/common/rmq';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  const configService = app.get<ConfigService>(ConfigService);
  const rmqService = app.get<RmqService>(RmqService);
  const logger = app.get<Logger>(Logger);

  app.useLogger(logger);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const allowedOrigins = configService.get<string>(
    'ALLOWED_ORIGINS',
    'http://localhost:3000',
  );
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const queueName = configService.get<string>(
    'API_GATEWAY_QUEUE_NAME',
    'API_GATEWAY_QUEUE',
  );

  app.connectMicroservice(rmqService.getOptions(queueName));

  logger.log('Starting api gateway...');

  await app.startAllMicroservices();
  const port = configService.getOrThrow<number>('HTTP_PORT', 3004);
  await app.listen(port);
  logger.log(`Api gateway running on HTTP port ${port}`);
  logger.log('RabbitMQ microservice is listening for messages');
}

bootstrap().catch((err) => {
  console.error('Error starting gateway:', err);
  process.exit(1);
});
