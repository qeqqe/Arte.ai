import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_PROVIDER } from '@app/common';
import { linkedinJobs, userFetchedJobs } from '@app/common/jobpost';
import { SkillsData } from '@app/common/jobpost/skills.types';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class LinkedinService {
  private readonly logger = new Logger(LinkedinService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(DRIZZLE_PROVIDER)
    private readonly drizzle: NodePgDatabase,
    @Inject('ANALYSIS_SERVICE')
    private readonly analysisService: ClientProxy,
  ) {}

  async scrapeJob(jobId: string, userId: string): Promise<SkillsData> {
    try {
      const jobContent = await this.fetchJobContent(jobId);

      if (!jobContent) {
        throw new NotFoundException('No job content found');
      }

      this.logger.log(`Successfully retrieved job content for ID: ${jobId}`);

      try {
        this.logger.log('Sending job content to analysis service');

        const processedJobData = await firstValueFrom(
          this.analysisService.send('extract_skills', jobContent),
        );

        await this.storeJobPost(jobId, jobContent, processedJobData, userId);
        return processedJobData;
      } catch (analysisError) {
        this.logger.error(
          `Analysis service error: ${analysisError.message}`,
          analysisError.stack,
        );

        throw analysisError instanceof InternalServerErrorException
          ? analysisError
          : new InternalServerErrorException(
              `Failed to process job content: ${analysisError.message}`,
            );
      }
    } catch (err) {
      this.logger.error(`Error in scrapeJob: ${err.message}`, err.stack);

      if (
        err instanceof NotFoundException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }

      throw new InternalServerErrorException(
        `Failed to process job: ${err.message}`,
      );
    }
  }

  private async fetchJobContent(jobId: string): Promise<string | null> {
    const PYTHON_API_URL = this.configService.getOrThrow<string>('PYTHON_URL');
    this.logger.log(
      `Sending request to Python service: ${PYTHON_API_URL}/scrape-job?jobId=${jobId}`,
    );

    try {
      const resp = await firstValueFrom(
        this.httpService.get(`${PYTHON_API_URL}/scrape-job`, {
          params: {
            jobId: jobId,
          },
          timeout: 25000,
        }),
      );

      if (resp?.data?.md) {
        this.logger.log(
          `Successfully received job content from Python service: ${resp.data.md.substring(
            0,
            50,
          )}...`,
        );
        return resp.data.md as string;
      } else {
        this.logger.error(
          `Python service returned invalid response format: ${JSON.stringify(
            resp?.data || 'No data',
          )}`,
        );
        throw new NotFoundException(
          'No job content found in Python service response',
        );
      }
    } catch (error) {
      if (error?.response?.data) {
        this.logger.error(
          `Python service error response: ${JSON.stringify(
            error.response.data,
          )}`,
        );
      }

      this.logger.error(
        `Exception during Python service request: ${error.message}`,
        error.stack,
      );

      if (error.code === 'ECONNREFUSED') {
        this.logger.error(
          `Could not connect to Python service at ${PYTHON_API_URL}. Make sure the service is running and accessible.`,
        );
        throw new InternalServerErrorException('Python service unavailable');
      }

      throw new NotFoundException('Failed to retrieve job content');
    }
  }

  private async storeJobPost(
    linkedinJobId: string,
    jobInfo: string,
    processedJobData: SkillsData,
    userId: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `Starting transaction to store job ID: ${linkedinJobId} for user: ${userId}`,
      );

      await this.drizzle.transaction(async (tx) => {
        this.logger.log(`Inserting job into linkedinJobs table...`);

        const [jobPost] = await tx
          .insert(linkedinJobs)
          .values({
            linkedinJobId,
            processedSkills: processedJobData as unknown as JSON,
            jobInfo,
          })
          .onConflictDoUpdate({
            target: linkedinJobs.linkedinJobId,
            set: {
              jobInfo,
              processedSkills: processedJobData as unknown as JSON,
            },
          })
          .returning();

        this.logger.log(
          `Job inserted/updated successfully with ID: ${jobPost.id}`,
        );

        this.logger.log(`Creating user-job relationship...`);
        await tx
          .insert(userFetchedJobs)
          .values({
            userId,
            linkedinJobSchemaId: jobPost.id,
          })
          .onConflictDoNothing({
            target: [
              userFetchedJobs.userId,
              userFetchedJobs.linkedinJobSchemaId,
            ],
          });

        this.logger.log(`User-job relationship created or already exists`);
      });

      this.logger.log(
        `Transaction completed: Job post stored successfully for jobId: ${linkedinJobId}, userId: ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to store job post: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to store job information');
    }
  }
}
