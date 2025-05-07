import { DRIZZLE_PROVIDER } from '@app/common';
import { linkedinJobs, userFetchedJobs } from '@app/common/jobpost';
import { eq } from 'drizzle-orm';

import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class DashboardService {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    @Inject(DRIZZLE_PROVIDER)
    private readonly drizzle: NodePgDatabase,
  ) {}
  async getRecentJobComparisons(userId: string): Promise<any> {
    try {
      const recentJobComparisons = await this.drizzle
        .select({ linkedinJobs: linkedinJobs })
        .from(userFetchedJobs)
        .where(eq(userFetchedJobs.userId, userId));
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
}
