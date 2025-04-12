import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AuthModule, DrizzleModule, LoggerModule } from '@app/common';
import { HttpModule } from '@nestjs/axios';
import { RmqModule } from '@app/common/rmq/rmq.module';
import { StatsService } from './services/stats/stats.service';
import { StatsController } from './controller/stats/stats.controller';
import { SkillsController } from './controller/skills/skills.controller';
import { CompareService } from './services/compare/compare.service';
import { CompareController } from './controller/compare/compare.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OpenAi } from './services/open-ai-service/open-ai.service';
import { OpenAiController } from './controller/open-ai/open-ai.controller';

@Module({
  imports: [
    LoggerModule,
    HttpModule,
    DrizzleModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), 'apps', 'analysis', '.env'),
        join(process.cwd(), '.env'),
        '.env',
      ],
    }),
    RmqModule.register({ name: 'ANALYSIS_SERVICE' }),
    ClientsModule.registerAsync([
      {
        name: 'INGESTION_SERVICE',
        useFactory: async (configService: ConfigService) => ({
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
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [
    StatsController,
    SkillsController,
    CompareController,
    OpenAiController,
  ],
  providers: [StatsService, CompareService, OpenAi],
})
export class AnalysisModule {}
