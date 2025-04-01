import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { SkillsService } from '../../services/skills/skills.service';
import { Logger } from 'nestjs-pino';
import { SkillsData } from '../../types/skills.types';

@Controller('skills')
export class SkillsController {
  constructor(
    private readonly skillsService: SkillsService,
    private readonly logger: Logger,
  ) {}

  @Post('initialize')
  async initializeDatabase() {
    try {
      await this.skillsService.initializeDatabase();
      return { message: 'database initialized successfully' };
    } catch (error) {
      this.logger.error(
        `failed to initialize database: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `failed to initialize database: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('seed')
  async seedSkillsData(@Body() body: { data?: SkillsData } | SkillsData) {
    try {
      const skillsData: SkillsData =
        body.data && typeof body.data === 'object' && !Array.isArray(body.data)
          ? body.data
          : (body as SkillsData);

      if (!skillsData || typeof skillsData !== 'object') {
        throw new HttpException(
          'invalid skills data format',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log('received skills data for seeding');
      await this.skillsService.storeSkillsData(skillsData);
      return { message: 'skills data stored successfully' };
    } catch (error) {
      this.logger.error(
        `failed to store skills data: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `failed to store skills data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('extract')
  async extractSkills(
    @Body() body: { jobPosting: string; jobId?: string; title?: string },
  ) {
    try {
      const { jobPosting, jobId, title } = body;

      if (!jobPosting || typeof jobPosting !== 'string') {
        throw new HttpException(
          'job posting text is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const extractedSkills = await this.skillsService.extractSkills(
        jobPosting,
      );
      const insertedJobId = await this.skillsService.storeJobPosting(
        jobId || `job_${Date.now()}`,
        jobPosting,
        title,
        extractedSkills,
      );

      return {
        jobId: insertedJobId,
        extractedSkills,
      };
    } catch (error) {
      this.logger.error(
        `error extracting skills: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `failed to extract skills: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('similar')
  async findSimilarSkills(
    @Query('skillText') skillText: string,
    @Query('limit') limit?: number,
  ) {
    try {
      if (!skillText) {
        throw new HttpException(
          'skill text query is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const similarSkills = await this.skillsService.findSimilarSkills(
        skillText,
        limit ? Number(limit) : 10,
      );

      return { similarSkills };
    } catch (error) {
      this.logger.error(
        `error finding similar skills: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        `failed to find similar skills: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
