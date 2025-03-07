import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AuthModule, DrizzleModule, LoggerModule } from '@app/common';
import { GetStatController } from './controllers/get-stat/get-stat.controller';
import { GetStatService } from './services/get-stat/get-stat.service';
import { HttpModule } from '@nestjs/axios';
import { RmqModule } from '@app/common/rmq/rmq.module';

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
  controllers: [GetStatController],
  providers: [GetStatService],
})
export class AnalysisModule {}
