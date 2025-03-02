import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { LinkedinService } from '../../services/linkedin/linkedin.service';

@Controller('linkedin')
export class LinkedinController {
  constructor(private readonly linkedinService: LinkedinService) {}

  @Get('scrape-job')
  async scrapeJob(
    @Query('jobId') jobId: string,
  ): Promise<string | NotFoundException> {
    return this.linkedinService.scrapeJob(jobId);
  }
}
