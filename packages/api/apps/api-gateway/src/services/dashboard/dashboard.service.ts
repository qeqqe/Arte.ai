import { DRIZZLE_PROVIDER, users } from '@app/common';
import { linkedinJobs, userFetchedJobs } from '@app/common/jobpost';
import { eq } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Logger } from 'nestjs-pino';

@Injectable()
export class DashboardService {
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    @Inject(DRIZZLE_PROVIDER)
    private readonly drizzle: NodePgDatabase,
  ) {}
  async getRecentJobComparisons(userId: string): Promise<any> {
    try {
      const recentJobComparisons = await this.drizzle
        .select({
          comparison: userFetchedJobs.comparison,
          jobInfo: linkedinJobs.jobInfo,
          processedSkills: linkedinJobs.processedSkills,
        })
        .from(userFetchedJobs)
        .innerJoin(
          linkedinJobs,
          eq(userFetchedJobs.linkedinJobSchemaId, linkedinJobs.id),
        )
        .where(eq(userFetchedJobs.userId, userId))
        .limit(3);
      return recentJobComparisons;
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
}
