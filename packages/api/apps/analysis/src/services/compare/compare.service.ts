import { DRIZZLE_PROVIDER, users } from '@app/common';
import { linkedinJobs } from '@app/common/jobpost';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '@app/common/jobpost';
import OpenAI from 'openai';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { linkedinJobs as LinkedInJobs } from '@app/common/jobpost';
import { OpenAi } from '../open-ai-service/open-ai.service';
import { StatsService } from '../stats/stats.service';
@Injectable()
export class CompareService {
  private readonly logger = new Logger(CompareService.name);
  private openAIClient: OpenAI;
  private responseCache = new Map<
    string,
    { response: string; timestamp: number }
  >();
  private readonly CACHE_TTL = 3600000; // 1h ttl

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly statService: StatsService,
    private readonly openAiService: OpenAi,
    @Inject(DRIZZLE_PROVIDER)
    private readonly drizzle: NodePgDatabase<typeof schema>,
  ) {
    const OPENAI_API_KEY = this.configService.get<string>('OPENAI_API_KEY');
    const baseURL = this.configService.get<string>(
      'GITHUB_MODEL_ENDPOINT',
      'https://models.inference.ai.azure.com',
    );

    if (!OPENAI_API_KEY) {
      this.logger.error('GitHub token is not configured');
      throw new Error('GitHub token is missing from configuration');
    }

    this.logger.log(
      'Initializing OpenAI client with GitHub marketplace models',
    );
    this.openAIClient = new OpenAI({
      apiKey: OPENAI_API_KEY,
      baseURL: baseURL,
      timeout: 30000,
    });
  }

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
        this.getJobInfo(userId, jobId),
        this.getUserSkills(userId),
      ]);

      const analysisResponse = await this.generateSkillGapAnalysis(
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
      await this.scrapeJobInfo(userId, jobId);

      jobInfo = await this.drizzle
        .select({
          jobInfo: linkedinJobs.jobInfo,
          processedSkills: linkedinJobs.processedSkills,
        })
        .from(linkedinJobs)
        .where(eq(linkedinJobs.linkedinJobId, jobId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!jobInfo?.jobInfo) {
        throw new NotFoundException('Job information could not be found');
      }
    }

    // if not processed
    if (jobInfo.processedSkills === null) {
      this.logger.log(
        `No processed skills found for job ${jobId}, extracting skills`,
      );
      jobInfo.processedSkills = await this.openAiService.extractSkills(
        jobInfo.jobInfo,
      );
      await this.drizzle
        .update(LinkedInJobs)
        .set({ processedSkills: jobInfo.processedSkills } as any)
        .where(eq(LinkedInJobs.id, jobId));
    }

    return jobInfo;
  }

  private async scrapeJobInfo(userId: string, jobId: string): Promise<void> {
    const JOB_SCRAPE_URL =
      this.configService.getOrThrow<string>('JOB_SCRAPER_URL');

    this.logger.log(`Requesting job scraping from ${JOB_SCRAPE_URL}`);
    await firstValueFrom(
      this.httpService.post(JOB_SCRAPE_URL, { userId, jobId }).pipe(
        catchError((error) => {
          this.logger.error(`Error scraping job: ${error.message}`);
          throw new NotFoundException('Failed to retrieve job information');
        }),
      ),
    );
    this.logger.log(`Job scraping request completed for ${jobId}`);
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

  private async generateSkillGapAnalysis(
    candidateSkills: any,
    jobRequirements: any,
    additionalContext?: string,
  ): Promise<string> {
    this.logger.debug('Sending request to GitHub marketplace models');
    const model = this.configService.get<string>('GITHUB_MODEL', 'gpt-4o-mini');

    try {
      const prompt = this.buildSkillGapPrompt(
        candidateSkills,
        jobRequirements,
        additionalContext,
      );

      this.logger.debug(`Using model: ${model}`);
      const response = await this.openAIClient.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are a skilled career advisor and technical skills expert.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 2000,
        top_p: 1,
      });

      if (!response.choices || !response.choices[0]?.message?.content) {
        throw new Error('Invalid response from GitHub AI model');
      }

      this.logger.debug('Successfully received response from model');
      return response.choices[0].message.content;
    } catch (error) {
      this.logger.error(
        `Error in generateSkillGapAnalysis: ${error.message}`,
        error.stack,
      );
      if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
        throw new Error('Model request timed out. Please try again.');
      } else if (error.name === 'RateLimitError') {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      throw error;
    }
  }

  private buildSkillGapPrompt(
    candidateSkills: any,
    jobRequirements: any,
    additionalContext?: string,
  ): string {
    return `
      I need a detailed analysis of the skill gap between a candidate and job requirements.
      
      ## CANDIDATE SKILLS
      ${JSON.stringify(candidateSkills, null, 2)}
      
      ## JOB REQUIREMENTS
      ${JSON.stringify(jobRequirements, null, 2)}
      
      ${
        additionalContext ? `## ADDITIONAL CONTEXT\n${additionalContext}\n` : ''
      }
      
      Please provide:
      1. A skill gap analysis with match percentage for each required skill
      2. Overall suitability score (0-100)
      3. Specific recommendations for skills to develop
      4. Estimated time to close each skill gap
      5. Suggested learning resources for each missing skill
      
      Format the response as JSON with the following structure:
      {
        "matchedSkills": [...],
        "gapAnalysis": [...],
        "overallScore": number,
        "recommendations": [...],
        "insights": "string"
      }
    `;
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
