import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RmqService } from './rmq.service';

interface RmqModuleOptions {
  name: string;
}

@Module({
  imports: [ConfigModule],
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {
  static register({ name }: RmqModuleOptions): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name,
            useFactory: (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [
                  configService.get<string>(
                    'RABBITMQ_URI',
                    'amqp://guest:guest@rabbitmq:5672',
                  ),
                ],
                queue: name,
                queueOptions: {
                  durable: true,
                },
                prefetchCount: configService.get<number>(
                  'RABBITMQ_PREFETCH_COUNT',
                  10,
                ),
                noAck: configService.get<boolean>('RABBITMQ_NO_ACK', false),
                persistent: true,
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }

  static registerBulk(queues: string[]): DynamicModule[] {
    return queues.map((queue) => this.register({ name: queue }));
  }
}
