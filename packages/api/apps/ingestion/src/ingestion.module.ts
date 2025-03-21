import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import {
  DrizzleModule,
  LoggerModule,
  AuthModule,
  DRIZZLE_PROVIDER,
  DrizzleProvider,
} from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import * as Joi from 'joi';
import { GithubController } from './controllers/github/github.controller';
import { LinkedinController } from './controllers/linkedin/linkedin.controller';
import { ResumeController } from './controllers/resume/resume.controller';
import { LeetcodeController } from './controllers/leetcode/leetcode.controller';
import { GithubService } from './services/github/github.service';
import { LinkedinService } from './services/linkedin/linkedin.service';
import { ResumeService } from './services/resume/resume.service';
import { LeetcodeService } from './services/leetcode/leetcode.service';
import { RmqModule } from '@app/common/rmq/rmq.module';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './controllers/health/health.controller';
import { TestController } from './test.controller';

@Module({
  imports: [
    LoggerModule,
    DrizzleModule,
    HttpModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), 'apps', 'ingestion', '.env'),
        join(process.cwd(), '.env'),
        '.env',
      ],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').required(),
        RABBITMQ_URI: Joi.string().required(),
        HTTP_PORT: Joi.number().required(),
        FRONTEND_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
      }),
    }),
    RmqModule.register({ name: 'INGESTION_SERVICE' }),
  ],
  controllers: [
    IngestionController,
    GithubController,
    LinkedinController,
    ResumeController,
    LeetcodeController,
    HealthController,
    TestController,
  ],
  providers: [
    IngestionService,
    GithubService,
    LinkedinService,
    ResumeService,
    LeetcodeService,
    DrizzleProvider,
    {
      provide: DRIZZLE_PROVIDER,
      useFactory: async (drizzleProvider: DrizzleProvider) => {
        return await drizzleProvider.createClient();
      },
      inject: [DrizzleProvider],
    },
  ],
})
export class IngestionModule {}
