import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { CompareService } from '../../service/compare/compare.service';
import { JwtAuthGuard, UserPayload } from '@app/common';
import { Request } from 'express';

@Controller('compare')
export class CompareController {
  constructor(private readonly compareService: CompareService) {}

  @Get('job')
  @UseGuards(JwtAuthGuard)
  compareUserToJob(
    @Query('jobId') jobId: string,
    @Req() request: Request & { user: UserPayload },
  ): Promise<string> {
    const userId = request.user.id;
    return this.compareService.compareUserToJob(jobId, userId);
  }
}
