import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { JwtAuthGuard, UserPayload } from '@app/common';
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('recent-job-comparisons')
  @UseGuards(JwtAuthGuard)
  async getRecentJobComparisons(@Req() request: Request): Promise<any> {
    const user = request['user'] as UserPayload;
    return await this.dashboardService.getRecentJobComparisons(user.id);
  }
}
