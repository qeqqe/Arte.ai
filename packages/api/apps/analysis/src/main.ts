import { NestFactory } from '@nestjs/core';
import { AnalysisModule } from './analysis.module';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AnalysisModule);
  const configService = app.get<ConfigService>(ConfigService);
  const logger = app.get<Logger>(Logger);

  app.useLogger(logger);

  // Connecting to RMQ with consistent settings
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URI')],
      queue: 'ANALYSIS_SERVICE',
      queueOptions: {
        durable: true,
      },
      noAck: true,
    },
  });

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
