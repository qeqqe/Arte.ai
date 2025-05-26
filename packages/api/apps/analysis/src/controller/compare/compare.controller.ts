import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { CompareService } from '../../services/compare/compare.service';
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
  ): Promise<any> {
    const userId = request.user.id;
    return this.compareService.compareUserToJob(jobId, userId);
  }
}
