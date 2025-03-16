import { JwtAuthGuard, UserPayload } from '@app/common';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { GithubService } from '../../services/github/github.service';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('user-github')
  @UseGuards(JwtAuthGuard)
  async getUserTopRepo(@Req() request: Request): Promise<any> {
    const user = request['user'] as UserPayload;
    return this.githubService.getUserRepoData(user.id);
  }
}
