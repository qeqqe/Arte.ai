import { DRIZZLE_PROVIDER, UserLeetcodeSchema, users } from '@app/common';
import { userPinnedRepo } from '@app/common/github';
import { linkedinJobs as LinkedInJobs } from '@app/common/jobpost';
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

  async getUserSkillInfo(userId: string): Promise<any> {
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
              proccessedLeetcodeStat: leetcodestat.proccessedLeetcodeStat,
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

      try {
        const pythonServiceUrl =
          this.configService.getOrThrow<string>('PYTHON_URL');

        const payload = {
          userGithubRepos: userGithubRepos,
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
                proccessedLeetcodeStat: leetcodestat.proccessedLeetcodeStat,
              }
            : null,
        };

        const processedResponse = await this.httpService.axiosRef.post(
          `${pythonServiceUrl}/extract-skills`,
          { text: JSON.stringify(payload) },
        );

        this.logger.log('Successfully processed user data');

        if (leetcodestat && processedResponse.data.leetcode) {
          try {
            this.logger.log('Updating processed LeetCode stats in database');

            await this.drizzle
              .update(UserLeetcodeSchema)
              .set({
                proccessedLeetcodeStat: processedResponse.data.leetcode,
              } as unknown as typeof UserLeetcodeSchema.$inferInsert)
              .where(eq(UserLeetcodeSchema.userId, userId));

            this.logger.log('Successfully updated processed LeetCode stats');
          } catch (dbError) {
            this.logger.error(
              `Failed to update processed LeetCode stats: ${dbError.message}`,
              dbError.stack,
            );
          }
        }
        if (processedResponse.data.skills) {
          try {
            this.logger.log('Updating processed User stats in database');

            await this.drizzle
              .update(users)
              .set({
                userProccessedSkills: processedResponse.data.skills,
              } as unknown as typeof users.$inferInsert)
              .where(eq(users.id, userId));

            this.logger.log('Successfully updated processed LeetCode stats');
          } catch (dbError) {
            this.logger.error(
              `Failed to update processed LeetCode stats: ${dbError.message}`,
              dbError.stack,
            );
          }
        }

        return processedResponse.data;
      } catch (error) {
        this.logger.error(
          `Failed to process user data: ${error.message}`,
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

  async getJobPostInfo(JobId: string): Promise<JSON | typeof Error> {
    try {
      const FetchedlinkedInJob = await this.drizzle
        .select()
        .from(LinkedInJobs)
        .where(eq(LinkedInJobs.id, JobId));

      if (!FetchedlinkedInJob.length) {
        this.logger.error(`Job with ID ${JobId} not found`);
        throw new Error(`Job with ID ${JobId} not found`);
      }

      const linkedInJob = FetchedlinkedInJob[0];

      const pythonServiceUrl =
        this.configService.getOrThrow<string>('PYTHON_URL');

      const processedJobPostingResponse = await this.httpService.axiosRef.post(
        `${pythonServiceUrl}/extract-job-skill`,
        { text: linkedInJob.jobInfo },
      );

      this.logger.log(`Received data from Python service`);

      await this.drizzle
        .update(LinkedInJobs)
        .set({ processedSkills: processedJobPostingResponse.data } as any)
        .where(eq(LinkedInJobs.id, JobId));

      return processedJobPostingResponse.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch user data: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
