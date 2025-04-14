import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, RmqOptions, Transport } from '@nestjs/microservices';
import { RmqService } from './rmq.service';

interface RmqModuleOptions {
  name: string;
}

@Module({})
export class RmqModule {
  static register({ name }: RmqModuleOptions): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name,
            useFactory: (configService: ConfigService): RmqOptions => ({
              transport: Transport.RMQ,
              options: {
                urls: [configService.getOrThrow<string>('RABBITMQ_URI')],
                queue: name,
                noAck: true,
                persistent: true,
                queueOptions: {
                  durable: true,
                  arguments: {
                    'x-message-ttl': 300000,
                  },
                },
                prefetchCount: 1,
                socketOptions: {
                  heartbeatIntervalInSeconds: 30,
                  reconnectTimeInSeconds: 5,
                },
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      providers: [RmqService],
      exports: [ClientsModule, RmqService],
    };
  }
}
