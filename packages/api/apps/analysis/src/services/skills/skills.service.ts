import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { SkillsData, SimilarSkill } from '../../types/skills.types';
import { SingleStore } from '../single-store-service.ts/single-store.service';
import { OpenAi as OpenAiServiceService } from '../open-ai-service/open-ai.service';

@Injectable()
export class SkillsService {
  constructor(
    private readonly logger: Logger,
    private readonly singleStoreService: SingleStore,
    private readonly openAiService: OpenAiServiceService,
  ) {}

  async initializeDatabase(): Promise<void> {
    this.logger.log('initializing database');
    await this.singleStoreService.initialize();
  }

  async storeSkillsData(skillsData: SkillsData): Promise<void> {
    this.logger.log('storing skills data');
    await this.singleStoreService.storeSkillData(skillsData);
  }

  async extractSkills(jobPosting: string): Promise<SkillsData> {
    this.logger.log('extracting skills from job posting');
    try {
      return await this.openAiService.extractSkills(jobPosting);
    } catch (error) {
      this.logger.error(
        `error extracting skills: ${error.message}`,
        error.stack,
      );
      throw new Error(`failed to extract skills: ${error.message}`);
    }
  }

  async storeJobPosting(
    jobId: string,
    postingText: string,
    postingTitle?: string,
    extractedSkills?: SkillsData,
  ): Promise<number> {
    this.logger.log(`storing job posting with id: ${jobId}`);
    return this.singleStoreService.storeJobPosting(
      jobId,
      postingText,
      postingTitle,
      extractedSkills,
    );
  }

  async findSimilarSkills(
    skillText: string,
    limit = 10,
  ): Promise<SimilarSkill[]> {
    this.logger.log(`finding similar skills for "${skillText}"`);
    return this.singleStoreService.findSimilarSkills(skillText, limit);
  }
}
