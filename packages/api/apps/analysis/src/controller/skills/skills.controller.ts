import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { SkillsService } from '../../services/skills/skills.service';
import { Logger } from 'nestjs-pino';
import { linkedinJobs as LinkedInJobs } from '@app/common/jobpost';

@Controller('skills')
export class SkillsController {
  constructor(
    private readonly skillsService: SkillsService,
    private readonly logger: Logger,
  ) {}

  @Post('extract')
  async extractSkills(@Body() body: typeof LinkedInJobs) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, jobInfo } = body;
      if (!jobInfo || typeof jobInfo !== 'string') {
        throw new HttpException(
          'job posting text is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const extractedSkills = await this.skillsService.extractSkills(jobInfo);

      return {
        jobId: id,
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
}
