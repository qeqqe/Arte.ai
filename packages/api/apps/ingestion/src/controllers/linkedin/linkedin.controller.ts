import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LinkedinService } from '../../services/linkedin/linkedin.service';
import { JwtAuthGuard, UserPayload } from '@app/common';
import { SkillsData } from 'apps/analysis/src/types/skills.types';

@Controller('linkedin')
export class LinkedinController {
  constructor(private readonly linkedinService: LinkedinService) {}

  @Get('scrape-job')
  @UseGuards(JwtAuthGuard)
  async scrapeJob(
    @Query('jobId') jobId: string,
    @Req() request: Request,
  ): Promise<SkillsData | NotFoundException> {
    const user = request['user'] as UserPayload;
    const jobDetails = await this.linkedinService.scrapeJob(jobId, user.id);
    return jobDetails;
  }
  // this one for other microservices to extract the job details if they aren't already
  @Post('scrape-job-microservice')
  async scrapeJobMicroservice(@Body() jobId: string, @Body() userId: string) {
    return this.linkedinService.scrapeJob(jobId, userId);
  }
}
