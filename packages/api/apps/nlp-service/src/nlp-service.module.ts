import { AuthModule, DrizzleModule, LoggerModule } from '@app/common';
import { RmqModule } from '@app/common/rmq/rmq.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), 'apps', 'nlp-service', '.env'),
        join(process.cwd(), '.env'),
        '.env',
      ],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => [{
        ttl: config.get<number>('THROTTLE_TTL', 60),
        limit: config.get<number>('THROTTLE_LIMIT', 100),
      }],
      inject: [ConfigService],
    }),
    AuthModule,
    DrizzleModule,
    HttpModule,
    LoggerModule,
    RmqModule.register({name: 'NLP_SERVICE'}),
  ],
  controllers: [],
  providers: [],
})
export class NlpServiceModule {}
