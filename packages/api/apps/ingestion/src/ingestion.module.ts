import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { DrizzleModule, LoggerModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import * as Joi from 'joi';

@Module({
  imports: [
    LoggerModule,
    DrizzleModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '..', '..', '..', 'apps', 'auth', '.env'),
        join(__dirname, '..', '.env'),
        '.env',
      ],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').required(),
        RABBITMQ_URI: Joi.string().required(),
        HTTP_PORT: Joi.number().required(),
        FRONTEND_URL: Joi.string().required(),
      }),
    }),
  ],
  controllers: [IngestionController],
  providers: [IngestionService],
})
export class IngestionModule {}
