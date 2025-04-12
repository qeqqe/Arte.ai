import { NestFactory } from '@nestjs/core';
import { AnalysisModule } from './analysis.module';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { RmqOptions } from '@nestjs/microservices';
import { RmqService } from '@app/common/rmq/rmq.service';
import { purgeQueuesOnStartup } from './bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AnalysisModule);
  const rmqService = app.get<RmqService>(RmqService);
  const configService = app.get<ConfigService>(ConfigService);

  const logger = app.get<Logger>(Logger);
  app.useLogger(logger);

  // Purge queues before starting microservices
  await purgeQueuesOnStartup(configService, rmqService);

  app.connectMicroservice<RmqOptions>(
    rmqService.getOptions('ANALYSIS_SERVICE', true),
  );

  await app.startAllMicroservices();

  const port = configService.get<number>('HTTP_PORT', 3003);
  await app.listen(port);

  logger.log(`Analysis service running on port ${port}`);
}

bootstrap();
