import { DRIZZLE_PROVIDER } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Logger } from 'nestjs-pino';
import { userGithubSchema } from '@app/common/github';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserService {
  constructor(
    private readonly logger: Logger,
    @Inject(DRIZZLE_PROVIDER)
    private readonly drizzle: NodePgDatabase,
  ) {}

  async getUserProfile(userId: string): Promise<{
    username: string;
    avatarUrl: string;
  }> {
    try {
      const userInfo = await this.drizzle
        .select({
          username: userGithubSchema.username,
          avatarUrl: userGithubSchema.avatarUrl,
        })
        .from(userGithubSchema)
        .where(eq(userGithubSchema.userId, userId));

      if (userInfo.length === 0) {
        throw new Error('User not found');
      }

      const user = userInfo[0];
      return {
        username: user.username,
        avatarUrl: user.avatarUrl,
      };
    } catch (error: any) {
      this.logger.error('Failed to get user profile info', {
        error: error.message,
      });
      throw new Error('Failed to get user profile info');
    }
  }
}
