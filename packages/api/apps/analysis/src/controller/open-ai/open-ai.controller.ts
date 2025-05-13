import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SkillsData } from '../../types/skills.types';
import { OpenAi } from '../../services/open-ai-service/open-ai.service';
import { RmqService } from '@app/common/rmq/rmq.service';
import { ScrapedJob } from '@app/common/jobpost';

@Controller()
export class OpenAiController {
  private readonly logger = new Logger(OpenAiController.name);

  constructor(
    private readonly openAiService: OpenAi,
    private readonly rmqService: RmqService,
  ) {}

  @MessagePattern('extract_skills')
  async extractSkills(@Payload() jobContent: any): Promise<SkillsData> {
    this.logger.log('Received extract_skills request');
    this.logger.debug(
      `Job content type: ${typeof jobContent}, value: ${JSON.stringify(
        jobContent,
      ).substring(0, 200)}...`,
    );

    try {
      if (!jobContent) {
        this.logger.warn('No job content received');
        throw new Error('No job content received');
      }

      let parsedJobContent: ScrapedJob;
      if (typeof jobContent === 'string') {
        try {
          parsedJobContent = JSON.parse(jobContent);
        } catch (e) {
          this.logger.warn(`Failed to parse job content as JSON: ${e.message}`);
          throw new Error('Invalid job content format: not valid JSON');
        }
      } else if (typeof jobContent === 'object') {
        parsedJobContent = jobContent;
      } else {
        this.logger.warn(`Invalid job content type: ${typeof jobContent}`);
        throw new Error(`Invalid job content type: ${typeof jobContent}`);
      }

      if (!parsedJobContent.md && !parsedJobContent.description) {
        this.logger.warn(
          `Invalid job content structure: missing description and md fields`,
        );
        throw new Error('Invalid job content structure');
      }

      this.logger.log('Processing job content with OpenAI service');
      const result = await this.openAiService.extractSkills(parsedJobContent);
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
