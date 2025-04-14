import { DRIZZLE_PROVIDER, users } from '@app/common';
import { linkedinJobs } from '@app/common/jobpost';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '@app/common/jobpost';
import { HttpService } from '@nestjs/axios';
import { OpenAi } from '../open-ai-service/open-ai.service';
import { StatsService } from '../stats/stats.service';
import { ClientProxy } from '@nestjs/microservices';
@Injectable()
export class CompareService {
  private readonly logger = new Logger(CompareService.name);
  private responseCache = new Map<
    string,
    { response: string; timestamp: number }
  >();
  private readonly CACHE_TTL = 3600000;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly statService: StatsService,
    private readonly openAiService: OpenAi,
    @Inject(DRIZZLE_PROVIDER)
    private readonly drizzle: NodePgDatabase<typeof schema>,
    @Inject('INGESTION_SERVICE')
    private readonly ingestionService: ClientProxy,
  ) {}

  async compareUserToJob(jobId: string, userId: string): Promise<string> {
    this.logger.log(`Comparing user ${userId} with job ${jobId}`);

    const cacheKey = `${userId}:${jobId}`;
    const cachedResponse = this.getFromCache(cacheKey);

    if (cachedResponse) {
      this.logger.log(`Cache hit for ${cacheKey}`);
      return cachedResponse;
    }

    try {
      // fetch job and user data in parallel
      const [jobInfo, userProcessedSkills] = await Promise.all([
        this.getJobInfo(jobId, userId),
        this.getUserSkills(userId),
      ]);

      const analysisResponse =
        await this.openAiService.generateSkillGapAnalysis(
          userProcessedSkills,
          jobInfo.processedSkills,
        );

      this.storeInCache(cacheKey, analysisResponse);

      return analysisResponse;
    } catch (error) {
      this.logger.error(
        `Error in compareUserToJob: ${error.message}`,
        error.stack,
      );
      throw this.handleError(error, userId, jobId);
    }
  }

  private async getJobInfo(jobId: string, userId: string) {
    // get job data from database
    let jobInfo = await this.drizzle
      .select({
        jobInfo: linkedinJobs.jobInfo,
        processedSkills: linkedinJobs.processedSkills,
      })
      .from(linkedinJobs)
      .where(eq(linkedinJobs.linkedinJobId, jobId))
      .limit(1)
      .then((rows) => rows[0]);

    // if not found, fetch it and create it
    if (!jobInfo?.jobInfo) {
      this.logger.log(
        `Job info not found, scraping job details for jobId ${jobId}`,
      );
      await this.ingestionService.send('scrape_job', { jobId, userId });

      jobInfo = await this.drizzle
        .select({
          jobInfo: linkedinJobs.jobInfo,
          processedSkills: linkedinJobs.processedSkills,
        })
        .from(linkedinJobs)
        .where(eq(linkedinJobs.linkedinJobId, jobId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!jobInfo?.jobInfo || !jobInfo?.processedSkills) {
        throw new NotFoundException(
          'Job information could not be found or proccessed',
        );
      }
    }

    return jobInfo;
  }

  private async getUserSkills(userId: string) {
    this.logger.log(`Fetching skills for user ${userId}`);
    const userProcessedSkills = await this.drizzle
      .select({ userProcessedSkills: users.userProcessedSkills })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!userProcessedSkills) {
      try {
        this.logger.log(`User not found: ${userId}`);
        await this.statService.getUserSkillInfo(userId);
      } catch (error) {
        this.logger.error(
          `Error processing user data: ${error.message}`,
          error.stack,
        );
        throw new NotFoundException('User information could not be found');
      }
    }

    return userProcessedSkills;
  }

  private handleError(error: any, userId: string, jobId: string): Error {
    this.logger.error(
      `Error comparing user ${userId} to job ${jobId}: ${error.message}`,
      error.stack,
    );

    if (error.name === 'NotFoundException') {
      return new Error(`User or job not found: ${error.message}`);
    } else if (
      error.name === 'TimeoutError' ||
      error.message.includes('timeout')
    ) {
      return new Error('Model request timed out. Please try again.');
    } else if (error.name === 'RateLimitError') {
      return new Error('API rate limit exceeded. Please try again later.');
    } else if (error.message.includes('API key')) {
      return new Error(
        'Authentication issue. Please check server configuration.',
      );
    }

    return new Error(`Failed to compare user to job: ${error.message}`);
  }

  private getFromCache(key: string): string | null {
    const cached = this.responseCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.response;
    }
    return null;
  }

  private storeInCache(key: string, response: string): void {
    this.responseCache.set(key, {
      response,
      timestamp: Date.now(),
    });

    // clean up old cache time to time
    if (this.responseCache.size > 100) {
      this.cleanCache();
    }
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, value] of this.responseCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.responseCache.delete(key);
      }
    }
  }
}
