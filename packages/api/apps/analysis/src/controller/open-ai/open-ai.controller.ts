import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SkillsData } from '@app/common/jobpost/skills.types';
import { OpenAi } from '../../services/open-ai-service/open-ai.service';

@Controller()
export class OpenAiController {
  private readonly logger = new Logger(OpenAiController.name);

  constructor(private readonly openAiService: OpenAi) {}

  @EventPattern('extract_skills')
  async extractSkills(@Payload() jobContent: string): Promise<SkillsData> {
    this.logger.log('Received extract_skills request');

    if (!jobContent || typeof jobContent !== 'string') {
      this.logger.warn(`Invalid job content received: ${typeof jobContent}`);
      throw new Error('Invalid job content received');
    }

    return this.openAiService.extractSkills(jobContent);
  }
}
