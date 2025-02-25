import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { DrizzleModule, LoggerModule } from '@app/common';
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

@Module({
  imports: [
    LoggerModule,
    DrizzleModule,
    HttpModule,
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
    RmqModule.register({ name: 'INGESTION_SERVICE' }),
  ],
  controllers: [
    IngestionController,
    GithubController,
    LinkedinController,
    ResumeController,
    LeetcodeController,
  ],
  providers: [
    IngestionService,
    GithubService,
    LinkedinService,
    ResumeService,
    LeetcodeService,
  ],
})
export class IngestionModule {}
