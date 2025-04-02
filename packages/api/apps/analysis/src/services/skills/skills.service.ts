import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { SkillsData } from '../../types/skills.types';
import { OpenAi as OpenAiServiceService } from '../open-ai-service/open-ai.service';
import { DRIZZLE_PROVIDER } from '@app/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class SkillsService {
  constructor(
    private readonly logger: Logger,
    private readonly openAiService: OpenAiServiceService,
    @Inject(DRIZZLE_PROVIDER)
    private readonly drizzle: NodePgDatabase,
  ) {}

  async extractSkills(jobPosting: string): Promise<SkillsData> {
    this.logger.log('extracting skills from job posting');
    try {
      const response: SkillsData = await this.openAiService.extractSkills(
        jobPosting,
      );

      return response;
    } catch (error) {
      this.logger.error(
        `error extracting skills: ${error.message}`,
        error.stack,
      );
      throw new Error(`failed to extract skills: ${error.message}`);
    }
  }
}
