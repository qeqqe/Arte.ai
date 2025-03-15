import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AuthModule, DrizzleModule, LoggerModule } from '@app/common';
import { HttpModule } from '@nestjs/axios';
import { RmqModule } from '@app/common/rmq/rmq.module';
import { StatsService } from './services/stats/stats.service';
import { StatsController } from './controller/stats/stats.controller';
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
  controllers: [StatsController],
  providers: [StatsService],
})
export class AnalysisModule {}
