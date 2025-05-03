import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { AuthModule, DrizzleModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { RmqModule } from '@app/common/rmq';
import { LoggerModule } from '@app/common';

const QUEUE_NAMES = {
  ANALYSIS: 'ANALYSIS_QUEUE',
  INGESTION: 'INGESTION_QUEUE',
  AUTH: 'AUTH_QUEUE',
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), 'apps', 'api-gateway', '.env'),
        join(process.cwd(), '.env'),
        '.env',
      ],
    }),
    LoggerModule,
    DrizzleModule,
    AuthModule,
    RmqModule.register({ name: QUEUE_NAMES.ANALYSIS }),
    RmqModule.register({ name: QUEUE_NAMES.INGESTION }),
    RmqModule.register({ name: QUEUE_NAMES.AUTH }),
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
