import { JwtAuthGuard, UserPayload } from '@app/common';
import { Controller, Req, UseGuards } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { StatsService } from '../../services/stats/stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getStat(@Req() request: Request) {
    const user = request['user'] as UserPayload;
    return await this.statsService.getUserStat(user.id);
  }
}
