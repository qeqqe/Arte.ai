import { Injectable, Inject } from '@nestjs/common';
import { UserService } from './user.service';
import { TokenService } from './token.service';
import { GithubUserDto, TokenResponse } from '@app/dtos/github';
import { Logger } from 'nestjs-pino';
import { DRIZZLE_PROVIDER, users } from '@app/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly logger: Logger,
    @Inject(DRIZZLE_PROVIDER) private readonly db: NodePgDatabase,
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
        // Update GitHub access token
        await this.userService.updateGithubAccessToken(
          existingUser.user.id,
          githubUser.accessToken,
        );
        this.logger.log(
          `Updated GitHub access token for existing user: ${existingUser.user.id}`,
        );

        // Also update GitHub onboarding status
        await this.updateGithubOnboardingStatus(existingUser.user.id);
      } catch (error) {
        this.logger.error(
          `Failed to update GitHub access token: ${error.message}`,
        );
        // Continue with the flow even if update fails
      }

      return existingUser;
    }

    this.logger.log(`Creating new user for GitHub ID: ${githubUser.id}`);
    const newUser = await this.userService.createUser(githubUser);

    // Ensure onboarding status is set for new users
    await this.updateGithubOnboardingStatus(newUser.user.id);

    return newUser;
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

  async updateGithubOnboardingStatus(userId: string): Promise<void> {
    try {
      const [userResult] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (userResult) {
        const currentStatus = userResult.onboardingStatus || {
          github: false,
          leetcode: false,
          resume: false,
        };

        await this.db
          .update(users)
          .set({
            onboardingStatus: {
              ...currentStatus,
              github: true,
            },
          })
          .where(eq(users.id, userId));

        this.logger.log(`Updated GitHub onboarding status for user: ${userId}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to update GitHub onboarding status: ${error.message}`,
      );
      throw error;
    }
  }
}
