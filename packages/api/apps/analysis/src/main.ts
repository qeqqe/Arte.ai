import { NestFactory } from '@nestjs/core';
import { AnalysisModule } from './analysis.module';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { RmqService } from '@app/common/rmq';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AnalysisModule);
  const configService = app.get<ConfigService>(ConfigService);
  const rmqService = app.get<RmqService>(RmqService);
  const logger = app.get<Logger>(Logger);

  app.useLogger(logger);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const queueName = 'ANALYSIS_QUEUE';

  // connect to rmq with consistent settings
  app.connectMicroservice(rmqService.getOptions(queueName));

  logger.log('Starting analysis microservice');
  await app.startAllMicroservices();

  const port = configService.get<number>('HTTP_PORT', 3003);
  await app.listen(port);

  logger.log(`Analysis service running on HTTP port ${port}`);
  logger.log('RabbitMQ microservice is listening for messages');
}

bootstrap().catch((err) => {
  console.error('Error starting application:', err);
  process.exit(1);
});
