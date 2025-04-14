import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SkillsData } from '../../types/skills.types';
import { OpenAi } from '../../services/open-ai-service/open-ai.service';
import { RmqService } from '@app/common/rmq/rmq.service';

@Controller()
export class OpenAiController {
  private readonly logger = new Logger(OpenAiController.name);

  constructor(
    private readonly openAiService: OpenAi,
    private readonly rmqService: RmqService,
  ) {}

  @MessagePattern('extract_skills')
  async extractSkills(@Payload() jobContent: string): Promise<SkillsData> {
    this.logger.log('Received extract_skills request');

    try {
      if (!jobContent || typeof jobContent !== 'string') {
        this.logger.warn(`Invalid job content received: ${typeof jobContent}`);
        throw new Error('Invalid job content received');
      }

      this.logger.log('Processing job content with OpenAI service');
      const result = await this.openAiService.extractSkills(jobContent);
      this.logger.log('Successfully extracted skills from job content');

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to extract skills: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
