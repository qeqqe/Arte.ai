import { DRIZZLE_PROVIDER, UserLeetcodeSchema, users } from '@app/common';
import { userPinnedRepo } from '@app/common/github';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Logger } from 'nestjs-pino';
import { OpenAi as OpenAiService } from '../open-ai-service/open-ai.service';
@Injectable()
export class StatsService {
  constructor(
    private readonly logger: Logger,
    private readonly httpService: HttpService,
    @Inject(DRIZZLE_PROVIDER)
    private readonly drizzle: NodePgDatabase,
    private readonly configService: ConfigService,
    private readonly openAiService: OpenAiService,
  ) {}

  async getUserSkillInfo(userId: string): Promise<any> {
    try {
      this.logger.log(`Fetching stats for user: ${userId}`);

      const userResult = await this.drizzle
        .select({
          userProcessedSkills: users.userProcessedSkills,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      const userProcessedSkills = userResult[0]?.userProcessedSkills;

      if (
        userProcessedSkills &&
        typeof userProcessedSkills === 'object' &&
        Object.keys(userProcessedSkills).length > 0
      ) {
        this.logger.log(`Found existing processed skills for user: ${userId}`);
        return userProcessedSkills;
      }

      this.logger.log(
        `No valid processed skills found, generating for user: ${userId}`,
      );

      try {
        const FetcheduserPinnedRepoResults = await this.drizzle
          .select({ userGithubRepos: userPinnedRepo })
          .from(userPinnedRepo)
          .where(eq(userPinnedRepo.userId, userId));

        const userPinnedRepoResults = FetcheduserPinnedRepoResults.map(
          (item) => item.userGithubRepos,
        );

        const mappeduserPinnedRepoResults = userPinnedRepoResults.map(
          (repo) => ({
            description: repo.description,
            stargazerCount: repo.stargazerCount,
            forkCount: repo.forkCount,
            repositoryTopics: repo.repositoryTopics,
            readme: repo.readme,
            languages: repo.languages,
          }),
        );

        const fetchResume = await this.drizzle
          .select({ resume: users.resume })
          .from(users)
          .where(eq(users.id, userId));
        const resume: string = fetchResume[0]?.resume || '';

        const userProcessedLeetcodeStat = await this.fetchUserLeetcodeStat(
          userId,
        );

        const response = await this.openAiService.proccessUserInfo(
          mappeduserPinnedRepoResults,
          resume,
          userProcessedLeetcodeStat,
        );

        if (!response) {
          this.logger.warn(`No response from OpenAI for user: ${userId}`);
          return null;
        }

        this.logger.log(`Storing processed skills for user: ${userId}`);

        await this.drizzle
          .update(users)
          .set({
            userProcessedSkills: response,
          })
          .where(eq(users.id, userId));

        return response;
      } catch (error) {
        this.logger.error(
          `Failed to generate processed user info: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    } catch (error) {
      this.logger.error(
        `Failed to process user data: ${error.message}`,
        error.stack,
      );
      return { skills: {}, error: error.message };
    }
  }

  private async fetchUserLeetcodeStat(userId: string): Promise<any> {
    try {
      const leetcodeStatResult = await this.drizzle
        .select()
        .from(UserLeetcodeSchema)
        .where(eq(UserLeetcodeSchema.userId, userId));

      if (!leetcodeStatResult || leetcodeStatResult.length === 0) {
        this.logger.warn(`No leetcode info found for user: ${userId}`);
        return 'User leetcode stats not found!';
      }

      return leetcodeStatResult[0].proccessedLeetcodeStat;
    } catch (error) {
      this.logger.error(
        `Failed to fetch user data: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
