import { DRIZZLE_PROVIDER, UserLeetcodeSchema, users } from '@app/common';
import { userPinnedRepo } from '@app/common/github';
import { UserStatResponse } from '@app/dtos/analysis';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    private readonly configService: ConfigService,
  ) {}

  async getUserStat(userId: string): Promise<any> {
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
      this.logger.log(response);
      if (!leetcodestat && userPinnedRepoResults.length === 0) {
        this.logger.warn(`No data found for user: ${userId}`);
      }

      const userGithubRepos =
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
          : [];

      if (userGithubRepos.length === 0) {
        this.logger.warn(`No GitHub repositories found for user: ${userId}`);
        return { skills: {} };
      }

      try {
        const pythonServiceUrl =
          this.configService.getOrThrow<string>('PYTHON_URL');
        this.logger.log(
          `Sending GitHub repos to Python service at ${pythonServiceUrl}`,
        );

        const processedResponse = await this.httpService.axiosRef.post(
          `${pythonServiceUrl}/extract-skills`,
          { text: JSON.stringify(userGithubRepos) },
        );

        this.logger.log('Successfully processed GitHub repos');
        return processedResponse.data;
      } catch (error) {
        this.logger.error(
          `Failed to process user GitHub data: ${error.message}`,
          error.stack,
        );
        return { skills: {}, error: error.message };
      }
    } catch (error) {
      this.logger.error(
        `Failed to fetch user data: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
