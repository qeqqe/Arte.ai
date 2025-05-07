import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AuthModule, DrizzleModule, LoggerModule } from '@app/common';
import { HttpModule } from '@nestjs/axios';
import { RmqModule, RmqService } from '@app/common/rmq';
import { StatsService } from './services/stats/stats.service';
import { StatsController } from './controller/stats/stats.controller';
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
    RmqModule.register({ name: 'ANALYSIS_QUEUE' }),
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
            queue: 'INGESTION_QUEUE',
            queueOptions: {
              durable: true,
            },
            prefetchCount: parseInt(
              configService.get<string>('RABBITMQ_PREFETCH_COUNT', '10'),
              10,
            ),
            noAck: configService.get<boolean>('RABBITMQ_NO_ACK', false),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [StatsController, CompareController, OpenAiController],
  providers: [StatsService, CompareService, OpenAi, RmqService],
})
export class AnalysisModule {}
