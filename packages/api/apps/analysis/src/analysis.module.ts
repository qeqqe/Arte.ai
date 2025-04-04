import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AuthModule, DrizzleModule, LoggerModule } from '@app/common';
import { HttpModule } from '@nestjs/axios';
import { RmqModule } from '@app/common/rmq/rmq.module';
import { StatsService } from './services/stats/stats.service';
import { StatsController } from './controller/stats/stats.controller';
import { SkillsController } from './controller/skills/skills.controller';
import { SkillsService } from './services/skills/skills.service';
import { OpenAi as OpenAiService } from './services/open-ai-service/open-ai.service';
import { SingleStore } from './services/single-store-service.ts/single-store.service';
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
  ],
  controllers: [StatsController, SkillsController],
  providers: [StatsService, SkillsService, SingleStore, OpenAiService],
})
export class AnalysisModule {}
