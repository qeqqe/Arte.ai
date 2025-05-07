import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { RmqService } from '@app/common/rmq';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const logger = app.get(Logger);
  const configService = app.get(ConfigService);
  const rmqService = app.get<RmqService>(RmqService);

  app.use(compression());
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());
  app.enableCors({
    origin: configService.get('FRONTEND_URL'),
    credentials: true,
  });
  app.useLogger(logger);

  const queueName = 'AUTH_QUEUE';

  app.connectMicroservice(rmqService.getOptions(queueName));

  logger.log('Starting auth microservice');
  await app.startAllMicroservices();

  const httpPort = configService.get('HTTP_PORT', 3001);
  await app.listen(httpPort);

  logger.log(`Auth service running on port ${httpPort}`);
  logger.log('RabbitMQ microservice is listening for messages');
}

bootstrap().catch((error) => {
  console.error('Failed to start auth service:', error);
  process.exit(1);
});
