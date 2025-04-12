import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, throwError, timer, of } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_PROVIDER } from '@app/common';
import { linkedinJobs, userFetchedJobs } from '@app/common/jobpost';
import { SkillsData } from '@app/common/jobpost/skills.types';
import { ClientProxy } from '@nestjs/microservices';
import { retryWhen, mergeMap, take } from 'rxjs/operators';

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

        // Use emit instead of send - event-based instead of request/response
        await this.analysisService.emit('extract_skills', jobContent);

        // Direct processing using OpenAI service
        const processedJobData = await this.processJobContent(jobContent);

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

  // Process content directly instead of waiting for RMQ response
  private async processJobContent(jobContent: string): Promise<SkillsData> {
    // Simple implementation to structure job content
    // In a real scenario, this would call the OpenAI service directly
    const defaultSkills: SkillsData = {
      languages: [],
      frontend_frameworks_libraries: [],
      frontend_styling_ui: [],
      backend_frameworks_runtime: [],
      databases_datastores: [],
      database_tools_orms: [],
      cloud_platforms: [],
      devops_cicd: [],
      infrastructure_as_code_config: [],
      monitoring_observability: [],
      ai_ml_datascience: [],
      mobile_development: [],
      testing_quality: [],
      apis_communication: [],
      architecture_design_patterns: [],
      security: [],
      methodologies_collaboration: [],
      operating_systems: [],
      web_servers_proxies: [],
      other_technologies_concepts: [],
      brief_job_description: [jobContent.slice(0, 200) + '...'],
      other_relevent_info: [],
    };

    // Extract common skills based on simple keyword search
    const lowerContent = jobContent.toLowerCase();

    if (lowerContent.includes('javascript'))
      defaultSkills.languages.push('JavaScript');
    if (lowerContent.includes('typescript'))
      defaultSkills.languages.push('TypeScript');
    if (lowerContent.includes('python')) defaultSkills.languages.push('Python');
    if (lowerContent.includes('react'))
      defaultSkills.frontend_frameworks_libraries.push('React');
    if (lowerContent.includes('node'))
      defaultSkills.backend_frameworks_runtime.push('Node.js');
    if (lowerContent.includes('aws')) defaultSkills.cloud_platforms.push('AWS');

    return defaultSkills;
  }

  private async fetchJobContent(jobId: string): Promise<string | null> {
    const PYTHON_API_URL = this.configService.getOrThrow<string>('PYTHON_URL');
    this.logger.log(
      `Sending request to Python service: ${PYTHON_API_URL}/scrape-job?jobId=${jobId}`,
    );

    try {
      const maxRetries = 3;
      const retryDelay = 1000;

      const resp = await firstValueFrom(
        this.httpService
          .get(`${PYTHON_API_URL}/scrape-job`, {
            params: {
              jobId: jobId,
            },
            timeout: 15000,
          })
          .pipe(
            retryWhen((errors) =>
              errors.pipe(
                mergeMap((error, i) => {
                  const retryAttempt = i + 1;
                  this.logger.warn(
                    `Request failed, attempt ${retryAttempt}/${maxRetries}: ${error.message}`,
                  );

                  if (retryAttempt <= maxRetries) {
                    return timer(retryDelay * retryAttempt);
                  }
                  return throwError(() => error);
                }),
                take(maxRetries),
              ),
            ),
            catchError((error: AxiosError) => {
              this.logger.error(`Error from Python service: ${error.message}`);
              if (error.response) {
                this.logger.error(
                  `Response error data: ${JSON.stringify(error.response.data)}`,
                );
              }

              return of(null);
            }),
          ),
      );

      if (resp && resp.data && resp.data.md) {
        return resp.data.md as string;
      }
    } catch (error) {
      this.logger.error(
        `Exception during Python service request: ${error.message}`,
      );
    }

    return null;
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
