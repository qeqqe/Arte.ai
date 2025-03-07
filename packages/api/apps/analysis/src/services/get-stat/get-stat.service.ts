import { DRIZZLE_PROVIDER, UserLeetcodeSchema } from '@app/common';
import { userPinnedRepo } from '@app/common/github';
import { UserStatResponse } from '@app/dtos/analysis';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Logger } from 'nestjs-pino';

@Injectable()
export class GetStatService {
  constructor(
    private readonly logger: Logger,
    private readonly httpService: HttpService,
    @Inject(DRIZZLE_PROVIDER)
    private readonly drizzle: NodePgDatabase,
  ) {}

  async getUserStat(userId: string): Promise<UserStatResponse> {
    try {
      this.logger.log(`Fetching stats for user: ${userId}`);

      const leetcodeStatResult = await this.drizzle
        .select()
        .from(UserLeetcodeSchema)
        .where(eq(UserLeetcodeSchema.userId, userId));

      const userPinnedRepoResults = await this.drizzle
        .select()
        .from(userPinnedRepo)
        .where(eq(userPinnedRepo.userId, userId));

      this.logger.log(
        `Found ${leetcodeStatResult.length} LeetCode stats and ${userPinnedRepoResults.length} pinned repos for user ${userId}`,
      );

      const leetcodestat = leetcodeStatResult[0];

      const response: UserStatResponse = {
        leetCodeStat: leetcodestat
          ? {
              id: leetcodestat.id,
              leetcodeUsername: leetcodestat.leetcodeUsername,
              totalSolved: leetcodestat.totalSolved,
              totalQuestions: leetcodestat.totalQuestions,
              easySolved: leetcodestat.easySolved,
              mediumSolved: leetcodestat.mediumSolved,
              hardSolved: leetcodestat.hardSolved,
              acceptanceRate: leetcodestat.acceptanceRate,
              ranking: leetcodestat.ranking,
              createdAt: leetcodestat.createdAt,
              updatedAt: leetcodestat.updatedAt,
            }
          : undefined,
        userGithubRepos:
          userPinnedRepoResults.length > 0
            ? userPinnedRepoResults.map((repo) => ({
                id: repo.id,
                name: repo.name,
                url: repo.url,
                description: repo.description,
                stargazerCount: repo.stargazerCount,
                forkCount: repo.forkCount,
                primaryLanguage: repo.primaryLanguage,
                repositoryTopics: repo.repositoryTopics,
                languages: repo.languages,
                readme: repo.readme,
                createdAt: repo.createdAt,
                updatedAt: repo.updatedAt,
              }))
            : [],
      };

      if (!leetcodestat && userPinnedRepoResults.length === 0) {
        this.logger.warn(`No data found for user: ${userId}`);
      }

      return response;
    } catch (error) {
      this.logger.error(
        `Failed to fetch user data: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
