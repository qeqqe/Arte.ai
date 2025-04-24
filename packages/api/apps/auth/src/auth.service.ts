import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { TokenService } from './token.service';
import { GithubUserDto, TokenResponse } from '@app/dtos/github';
import { Logger } from 'nestjs-pino';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly logger: Logger,
  ) {}

  async findOrCreateUser(githubUser: GithubUserDto) {
    this.logger.log(`Processing GitHub user: ${githubUser.username}`);

    // Log access token length for debugging
    this.logger.debug(
      `GitHub access token length: ${githubUser.accessToken?.length || 0}`,
    );

    const existingUser = await this.userService.findByGithubId(githubUser.id);
    if (existingUser) {
      this.logger.log(`Found existing user: ${existingUser.user.id}`);

      try {
        await this.userService.updateGithubAccessToken(
          existingUser.user.id,
          githubUser.accessToken,
        );
        this.logger.log(
          `Updated GitHub access token for existing user: ${existingUser.user.id}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to update GitHub access token: ${error.message}`,
        );
        // Continue with the flow even if update fails
      }

      return existingUser;
    }

    this.logger.log(`Creating new user for GitHub ID: ${githubUser.id}`);
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
