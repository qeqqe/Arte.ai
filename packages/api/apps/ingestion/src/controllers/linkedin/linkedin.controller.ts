import {
  Controller,
  Get,
  NotFoundException,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LinkedinService } from '../../services/linkedin/linkedin.service';
import { JwtAuthGuard, UserPayload } from '@app/common';
import { SkillsData } from '@app/common/jobpost/skills.types';
import { MessagePattern } from '@nestjs/microservices';
import { ScrapeJobMicroserviceDto } from '@app/dtos/linkedin';

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

  @MessagePattern('scrape_job')
  async scrapeJobMicroservice(data: ScrapeJobMicroserviceDto) {
    return this.linkedinService.scrapeJob(data.jobId, data.userId);
  }
}
