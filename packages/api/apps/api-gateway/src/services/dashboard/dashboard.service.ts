import { DRIZZLE_PROVIDER, users } from '@app/common';
import { linkedinJobs, userFetchedJobs } from '@app/common/jobpost';
import { eq } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Logger } from 'nestjs-pino';
import { userGithubSchema } from '@app/common/github';
import { JobComparisonsResponse } from '@app/common/jobpost/comparison.types';
import { SkillsData } from '@app/common/jobpost/skills.types';

@Injectable()
export class DashboardService {
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    @Inject(DRIZZLE_PROVIDER)
    private readonly drizzle: NodePgDatabase,
  ) {}
  async getJobComparisons(
    userId: string,
    fetchAll: boolean,
  ): Promise<JobComparisonsResponse> {
    try {
      const recentJobComparisons = await this.drizzle
        .select({
          comparison: userFetchedJobs.comparison,
          jobInfo: linkedinJobs.jobInfo,
          processedSkills: linkedinJobs.processedSkills,
          organization: linkedinJobs.organization,
          postedTimeAgo: linkedinJobs.postedTimeAgo,
        })
        .from(userFetchedJobs)
        .innerJoin(
          linkedinJobs,
          eq(userFetchedJobs.linkedinJobSchemaId, linkedinJobs.id),
        )
        .where(eq(userFetchedJobs.userId, userId))
        .limit(fetchAll ? 100 : 4);
      const userInfo = await this.getUserInfo(userId);
      const returnObject: JobComparisonsResponse = {
        recentJobComparisons: recentJobComparisons.map((job) => ({
          comparison: job.comparison,
          jobInfo: job.jobInfo,
          processedSkills: job.processedSkills,
          organization: job.organization,
          postedTimeAgo: job.postedTimeAgo,
        })),
        username: userInfo.username,
        avatarUrl: userInfo.avatarUrl,
      };
      return returnObject;
    } catch (error: any) {
      this.logger.error(
        'Failed to get recent job comparisons. Please try again',
        {
          error: error.message,
        },
      );
      return null;
    }
  }

  async getConnectedDataSources(userId: string): Promise<{
    github: boolean;
    leetcode: boolean;
    resume: boolean;
  } | null> {
    try {
      const onboardingStatus = await this.drizzle
        .select({
          onboardingStatus: users.onboardingStatus,
        })
        .from(users)
        .where(eq(users.id, userId));

      return onboardingStatus[0]?.onboardingStatus || null;
    } catch (error: any) {
      this.logger.error(
        'Failed to get connected data sources. Please try again',
        {
          error: error.message,
        },
      );
      return null;
    }
  }

  async getUserInfo(userId: string): Promise<{
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
      this.logger.error('Failed to get user info', {
        error: error.message,
      });
      throw new Error('Failed to get user info');
    }
  }

  async getUserProcessedSkills(userId: string): Promise<SkillsData | null> {
    try {
      return await this.drizzle
        .select({
          processedSkills: users.userProcessedSkills,
        })
        .from(users)
        .where(eq(users.id, userId))
        .then((result) => {
          if (result.length === 0) {
            return null;
          }
          return result[0].processedSkills || null;
        });
    } catch (error: any) {
      this.logger.error('Failed to get user processed skills', {
        error: error.message,
      });
      return null;
    }
  }
}
