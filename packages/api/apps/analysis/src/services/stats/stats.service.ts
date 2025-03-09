import { DRIZZLE_PROVIDER, UserLeetcodeSchema, users } from '@app/common';
import { userPinnedRepo } from '@app/common/github';
import { UserStatResponse } from '@app/dtos/analysis';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Logger } from 'nestjs-pino';

@Injectable()
export class StatsService {
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

      const fetchResume = await this.drizzle
        .select()
        .from(users)
        .where(eq(users.id, userId));

      const leetcodestat = leetcodeStatResult[0];

      const resume: string = fetchResume[0].resume;

      const response: UserStatResponse = {
        leetCodeStat: leetcodestat
          ? {
              leetcodeUsername: leetcodestat.leetcodeUsername,
              totalSolved: leetcodestat.totalSolved,
              totalQuestions: leetcodestat.totalQuestions,
              easySolved: leetcodestat.easySolved,
              mediumSolved: leetcodestat.mediumSolved,
              hardSolved: leetcodestat.hardSolved,
              acceptanceRate: leetcodestat.acceptanceRate,
              ranking: leetcodestat.ranking,
            }
          : undefined,
        userGithubRepos:
          userPinnedRepoResults.length > 0
            ? userPinnedRepoResults.map((repo) => ({
                name: repo.name,
                url: repo.url,
                description: repo.description,
                stargazerCount: repo.stargazerCount,
                forkCount: repo.forkCount,
                primaryLanguage: repo.primaryLanguage,
                repositoryTopics: repo.repositoryTopics,
                languages: repo.languages,
                readme: repo.readme,
              }))
            : [],
        resume,
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
