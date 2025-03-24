import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  Logger,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LeetcodeService } from '../../services/leetcode/leetcode.service';
import { JwtAuthGuard } from '@app/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

// Define DTOs inline to avoid import issues
export class LeetcodeUsernameDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}

export interface LeetcodeFetchResponse {
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
  ranking: number;
}

@ApiTags('leetcode')
@Controller('leetcode')
@UseGuards(JwtAuthGuard)
export class LeetcodeController {
  private readonly logger = new Logger(LeetcodeController.name);

  constructor(private readonly leetcodeService: LeetcodeService) {}

  @Get(':username')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch LeetCode data for a given username' })
  @ApiParam({
    name: 'username',
    description: 'LeetCode username to fetch data for',
  })
  async getByUsername(
    @Param('username') username: string,
    @Request() req,
  ): Promise<LeetcodeFetchResponse> {
    this.logger.log(
      `Received request to fetch LeetCode data for username: ${username}`,
    );
    return this.leetcodeService.fetchData(username, req.user);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch LeetCode data using body parameters' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async fetchByUsername(
    @Body() body: LeetcodeUsernameDto,
    @Request() req,
  ): Promise<LeetcodeFetchResponse> {
    this.logger.log(
      `Received POST request to fetch LeetCode data for username: ${body.username}`,
    );
    return this.leetcodeService.fetchData(body.username, req.user);
  }
}
