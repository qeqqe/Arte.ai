import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AuthModule, DrizzleModule } from '@app/common';
import { RmqModule } from '@app/common/rmq';
import { DashboardController } from './controllers/dashboard/dashboard.controller';
import { DashboardService } from './services/dashboard/dashboard.service';
import { UserController } from './controllers/user/user.controller';
import { UserService } from './services/user/user.service';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from '@app/common';

const QUEUE_NAMES = {
  ANALYSIS: 'ANALYSIS_QUEUE',
  INGESTION: 'INGESTION_QUEUE',
  AUTH: 'AUTH_QUEUE',
};

@Module({
  imports: [
    DrizzleModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), 'apps', 'api-gateway', '.env'),
        join(process.cwd(), '.env'),
        '.env',
      ],
    }),
    HttpModule,
    LoggerModule,
    AuthModule,
    RmqModule.register({ name: QUEUE_NAMES.ANALYSIS }),
    RmqModule.register({ name: QUEUE_NAMES.INGESTION }),
    RmqModule.register({ name: QUEUE_NAMES.AUTH }),
  ],
  controllers: [DashboardController, UserController],
  providers: [DashboardService, UserService],
})
export class ApiGatewayModule {}
