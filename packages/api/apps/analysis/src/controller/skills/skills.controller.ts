import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { linkedinJobs as LinkedInJobs } from '@app/common/jobpost';
import { OpenAi } from '../../services/open-ai-service/open-ai.service';

@Controller('skills')
export class SkillsController {
  constructor(
    private readonly openAiService: OpenAi,
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

      const extractedSkills = await this.openAiService.extractSkills(jobInfo);

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
