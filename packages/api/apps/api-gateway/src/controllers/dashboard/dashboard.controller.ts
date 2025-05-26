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
    return await this.dashboardService.getJobComparisons(user.id, false);
  }

  @Get('get-all-job-comparisons')
  @UseGuards(JwtAuthGuard)
  async getAllJobComparison(@Req() request: Request): Promise<any> {
    const user = request['user'] as UserPayload;
    return await this.dashboardService.getJobComparisons(user.id, true);
  }

  @Get('connected-data-sources')
  @UseGuards(JwtAuthGuard)
  async getConnectedDataSources(@Req() request: Request): Promise<any> {
    const user = request['user'] as UserPayload;
    return await this.dashboardService.getConnectedDataSources(user.id);
  }
}
