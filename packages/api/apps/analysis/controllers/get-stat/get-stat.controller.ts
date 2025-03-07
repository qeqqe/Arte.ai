import { JwtAuthGuard, UserPayload } from '@app/common';
import { Controller, Req, UseGuards } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { UserStatResponse } from '@app/dtos/analysis';
import { GetStatService } from '../../src/services/get-stat/get-stat.service';

@Controller('get-stat')
export class GetStatController {
  constructor(private readonly getStatService: GetStatService) {}

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getStat(@Req() request: Request): Promise<UserStatResponse | null> {
    const user = request['user'] as UserPayload;
    return await this.getStatService.getUserStat(user.id);
  }
}
