import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
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
            useFactory: (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [configService.getOrThrow<string>('RABBITMQ_URI')],
                queue: name,
                noAck: false,
                persistent: true,
                queueOptions: {
                  durable: true,
                },
                retryAttempts: 5,
                retryDelay: 5000,
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
