import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';
import * as amqplib from 'amqplib';

@Injectable()
export class RmqService {
  private readonly logger = new Logger(RmqService.name);

  constructor(private readonly configService: ConfigService) {}

  getOptions(queue: string, noAck = false): RmqOptions {
    const prefetchCount = parseInt(
      this.configService.get<string>('RABBITMQ_PREFETCH_COUNT', '10'),
      10,
    );
    const noAckValue = this.configService.get<boolean>(
      'RABBITMQ_NO_ACK',
      false,
    );

    return {
      transport: Transport.RMQ,
      options: {
        urls: [
          this.configService.get<string>(
            'RABBITMQ_URI',
            'amqp://guest:guest@rabbitmq:5672',
          ),
        ],
        queue,
        queueOptions: {
          durable: true,
        },
        prefetchCount,
        noAck: noAck ? noAck : noAckValue,
        persistent: true,
      },
    };
  }

  acknowledgeMessage(context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);
  }

  ack(context: RmqContext) {
    this.acknowledgeMessage(context);
  }

  async purgeQueue(queueName: string): Promise<void> {
    try {
      const rabbitMqUri = this.configService.getOrThrow<string>('RABBITMQ_URI');
      this.logger.log(
        `Connecting to RabbitMQ at ${rabbitMqUri} to purge queue: ${queueName}`,
      );

      const connection = await amqplib.connect(rabbitMqUri);
      const channel = await connection.createChannel();

      // Make sure the queue exists before purging
      await channel.assertQueue(queueName, { durable: true });

      // Purge the queue
      const result = await channel.purgeQueue(queueName);
      this.logger.log(
        `Purged ${result.messageCount} messages from queue: ${queueName}`,
      );

      await channel.close();
      await connection.close();
    } catch (error) {
      this.logger.error(
        `Failed to purge queue ${queueName}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
