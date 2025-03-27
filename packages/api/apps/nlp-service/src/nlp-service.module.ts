import { AuthModule, DrizzleModule, LoggerModule } from '@app/common';
import { RmqModule } from '@app/common/rmq/rmq.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import * as Joi from 'joi';
import { CompareController } from './controller/compare/compare.controller';
import { CompareService } from './service/compare/compare.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), 'apps', 'nlp-service', '.env'),
        join(process.cwd(), '.env'),
        '.env',
      ],
      validationSchema: Joi.object({
        OPENAI_API_KEY: Joi.string().required(),
        OPENAI_MODEL: Joi.string().default('gpt-4o'),
        OPENAI_BASE_URL: Joi.string().optional(),
        HTTP_PORT: Joi.number().default(3004),
        ALLOWED_ORIGINS: Joi.string().required(),
        THROTTLE_LIMIT: Joi.number().default(100),
        THROTTLE_TTL: Joi.number().default(60),
        CACHE_ENABLED: Joi.boolean().default(true),
        CACHE_TTL: Joi.number().default(3600),
        METRICS_ENABLED: Joi.boolean().default(true),
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60),
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
      inject: [ConfigService],
    }),
    AuthModule,
    DrizzleModule,
    HttpModule,
    LoggerModule,
    RmqModule.register({ name: 'NLP_SERVICE' }),
  ],
  controllers: [CompareController],
  providers: [CompareService],
})
export class NlpServiceModule {}
