import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';
import * as amqplib from 'amqplib';

@Injectable()
export class RmqService {
  private readonly logger = new Logger(RmqService.name);

  constructor(private readonly configService: ConfigService) {}

  getOptions(queue: string, noAck = false): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.getOrThrow<string>('RABBITMQ_URI')],
        queue: queue,
        noAck,
        persistent: true,
        queueOptions: {
          durable: true,
          arguments: {
            'x-message-ttl': 60000,
          },
        },
      },
    };
  }

  ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
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
