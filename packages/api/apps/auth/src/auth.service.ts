import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { TokenService } from './token.service';
import { GithubUserDto, TokenResponse } from '@app/dtos/github';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async findOrCreateUser(githubUser: GithubUserDto) {
    const existingUser = await this.userService.findByGithubId(githubUser.id);
    if (existingUser) {
      return existingUser;
    }
    return this.userService.createUser(githubUser);
  }

  async generateTokens(user: {
    user: { id: string };
    github: { email: string };
  }): Promise<TokenResponse> {
    return this.tokenService.generateTokens(user.user.id, user.github.email);
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.userService.updateUserRefreshToken(userId, refreshToken);
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    await this.userService.updateUserRefreshToken(userId, null);
  }
}
