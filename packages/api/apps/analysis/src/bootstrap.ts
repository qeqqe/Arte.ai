import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RmqService } from '@app/common/rmq/rmq.service';

const logger = new Logger('Bootstrap');

export async function purgeQueuesOnStartup(
  configService: ConfigService,
  rmqService: RmqService,
) {
  try {
    const queueName = configService.get<string>(
      'ANALYSIS_QUEUE_NAME',
      'ANALYSIS_SERVICE',
    );

    logger.log(`Starting queue purge for ${queueName}`);
    await rmqService.purgeQueue(queueName);
    logger.log('Successfully purged queues on startup');
  } catch (error) {
    logger.error(`Failed to purge queues: ${error.message}`, error.stack);
  }
}
