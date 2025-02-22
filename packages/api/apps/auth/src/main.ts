import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  // hybrid application (HTTP + TCP)
  const app = await NestFactory.create(AuthModule);
  const logger = app.get(Logger);
  const configService = app.get(ConfigService);

  // will be implemented later
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: configService.get('TCP_PORT'),
    },
  });

  const httpPort = configService.get('HTTP_PORT', 3001);
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
  logger.log(
    `TCP Microservice running on port ${configService.get('TCP_PORT')}`,
  );
  logger.log(`callback URL: ${configService.get('GITHUB_CALLBACK_URL')}`);
  logger.log(`node env: ${configService.get('NODE_ENV')}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start auth service:', error);
  process.exit(1);
});
