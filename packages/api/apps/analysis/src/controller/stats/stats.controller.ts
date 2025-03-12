import { JwtAuthGuard, UserPayload } from '@app/common';
import {
  Controller,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Get } from '@nestjs/common';
import { StatsService } from '../../services/stats/stats.service';
import { Logger } from 'nestjs-pino';

@Controller('stats')
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly logger: Logger,
  ) {}

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getStat(@Req() request: Request) {
    try {
      const user = request['user'] as UserPayload;
      this.logger.log(`Processing stats request for user: ${user.id}`);
      return await this.statsService.getUserStat(user.id);
    } catch (error) {
      this.logger.error(
        `Error in stats controller: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to process user statistics',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
