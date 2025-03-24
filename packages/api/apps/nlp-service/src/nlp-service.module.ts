import { AuthModule, DrizzleModule, LoggerModule } from '@app/common';
import { RmqModule } from '@app/common/rmq/rmq.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import * as Joi from 'joi';

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
        GROQ_API_KEY: Joi.string().optional(),
        OPENAI_API_KEY: Joi.string().optional(),
        CLAUDE_API_KEY: Joi.string().optional(),
        GEMINI_API_KEY: Joi.string().optional(),
        HTTP_PORT: Joi.number().default(3004),
        FRONTEND_URL: Joi.string().required(),
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
  controllers: [],
  providers: [],
})
export class NlpServiceModule {}
