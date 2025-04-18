import { NestFactory } from '@nestjs/core';
import { IngestionModule } from './ingestion.module';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(IngestionModule, {
    bufferLogs: true,
    cors: true,
  });

  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL');

  app.useLogger(app.get(Logger));

  app.use(cookieParser());
  app.use(compression());
  app.use(helmet());

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

  const server = app.getHttpAdapter().getInstance();

  if (server && server._router && server._router.stack) {
    const routes = server._router.stack
      .filter((layer) => layer.route)
      .map((layer) => {
        const route = layer.route;
        const methods = Object.keys(route.methods)
          .map((m) => m.toUpperCase())
          .join(',');
        return {
          path: route.path,
          method: methods,
        };
      });

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [
          configService.get<string>(
            'RABBITMQ_URI',
            'amqp://guest:guest@rabbitmq:5672',
          ),
        ],
        queue: configService.get<string>(
          'INGESTION_QUEUE_NAME',
          'INGESTION_QUEUE',
        ),
        queueOptions: {
          durable: true,
        },
        prefetchCount: 10,
        noAck: false,
        persistent: true,
      },
    });

    routes.forEach((r) => console.log(`${r.method} ${r.path}`));
  } else {
    console.log(
      'Unable to retrieve routes - server structure is different than expected',
    );
  }

  const port = configService.get<number>('HTTP_PORT', 3002);
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Ingestion service running on port ${port}`);
}

bootstrap();
