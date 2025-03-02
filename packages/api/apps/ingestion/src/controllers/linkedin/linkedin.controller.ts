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

@Controller('linkedin')
export class LinkedinController {
  constructor(private readonly linkedinService: LinkedinService) {}

  @Get('scrape-job')
  @UseGuards(JwtAuthGuard)
  async scrapeJob(
    @Query('jobId') jobId: string,
    @Req() request: Request,
  ): Promise<string | NotFoundException> {
    const user = request['user'] as UserPayload;
    const jobDetails = await this.linkedinService.scrapeJob(jobId, user.id);
    return jobDetails;
  }
}
