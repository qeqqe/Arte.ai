import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_PROVIDER } from '@app/common';
import { linkedinJobs, userFetchedJobs } from '@app/common/jobpost';
import { OpenAi } from 'apps/analysis/src/services/open-ai-service/open-ai.service';
import { SkillsData } from 'apps/analysis/src/types/skills.types';

@Injectable()
export class LinkedinService {
  private readonly logger = new Logger(LinkedinService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly openAiService: OpenAi,
    private readonly configService: ConfigService,
    @Inject(DRIZZLE_PROVIDER)
    private readonly drizzle: NodePgDatabase,
  ) {}

  async scrapeJob(jobId: string, userId: string): Promise<SkillsData> {
    try {
      const PYTHON_API_URL =
        this.configService.getOrThrow<string>('PYTHON_URL');
      this.logger.log(
        `Sending request to Python service: ${PYTHON_API_URL}/scrape-job?jobId=${jobId}`,
      );

      const resp = await firstValueFrom(
        this.httpService
          .get(`${PYTHON_API_URL}/scrape-job`, {
            params: {
              jobId: jobId,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(`Error from Python service: ${error.message}`);
              if (error.response) {
                this.logger.error(
                  `Response error data: ${JSON.stringify(error.response.data)}`,
                );
                this.logger.error(`Response status: ${error.response.status}`);
              }
              throw new InternalServerErrorException(
                `Failed to fetch job data: ${error.message}`,
              );
            }),
          ),
      );

      if (!resp.data || !resp.data.md) {
        this.logger.warn(`No markdown content returned for job ID: ${jobId}`);
        throw new NotFoundException('No job content found');
      }

      const jobContent = resp.data.md as string;

      const processedJobData: SkillsData =
        await this.openAiService.extractSkills(jobContent);

      await this.storeJobPost(jobId, jobContent, processedJobData, userId);

      return processedJobData;
    } catch (err) {
      this.logger.error(`Error in scrapeJob: ${err.message}`);
      if (
        err instanceof NotFoundException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }
      throw new NotFoundException('Job not found');
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
