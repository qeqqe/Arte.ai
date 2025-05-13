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
import { ScrapedJob, userFetchedJobs } from '@app/common/jobpost';
import { linkedinJobs, NewLinkedinJob } from '@app/common/jobpost';
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
      const jobContent: ScrapedJob = await this.fetchJobContent(jobId);

      if (!jobContent) {
        throw new NotFoundException('No job content found');
      }

      this.logger.log(`Successfully retrieved job content for ID: ${jobId}`);

      try {
        this.logger.log('Sending job content to analysis service');

        this.logger.debug(
          `Job content being sent: ${JSON.stringify({
            md: jobContent.md || '',
            description: jobContent.description || '',
            organization: jobContent.organization || {
              logo_url: '',
              name: '',
              location: '',
            },
            posted_time_ago: jobContent.posted_time_ago || '',
          })}`,
        );

        const processedJobData = await firstValueFrom(
          this.analysisService.send('extract_skills', jobContent),
        );

        this.logger.log(
          'Successfully received processed job data from analysis service',
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

  private async fetchJobContent(jobId: string): Promise<ScrapedJob | null> {
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

      const scrapedJobData: ScrapedJob = {
        md: '',
        description: '',
        organization: {
          logo_url: '',
          name: '',
          location: '',
        },
        posted_time_ago: '',
      };

      if (resp?.data?.md && resp?.data?.description) {
        this.logger.log(
          `Successfully received job content from Python service: ${resp.data.md.substring(
            0,
            50,
          )}...`,
        );

        scrapedJobData.md = resp.data.md;
        scrapedJobData.description = resp.data.description;

        if (resp?.data?.organization) {
          const org = {
            logo_url: resp.data.organization.logo_url || '',
            name: resp.data.organization.name || '',
            location: resp.data.organization.location || '',
          };

          scrapedJobData.organization = org;
          this.logger.log(`Organization processed: ${JSON.stringify(org)}`);
        }

        if (resp?.data?.posted_time_ago) {
          scrapedJobData.posted_time_ago = resp.data.posted_time_ago;
          this.logger.log(`Posted time ago: ${scrapedJobData.posted_time_ago}`);
        }

        return scrapedJobData;
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
    scrapedData: ScrapedJob,
    processedJobData: SkillsData,
    userId: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `Starting transaction to store job ID: ${linkedinJobId} for user: ${userId}`,
      );

      const jobDescriptionText = String(
        scrapedData.description || scrapedData.md,
      );

      const organization = {
        logo_url: String(scrapedData.organization?.logo_url || ''),
        name: String(scrapedData.organization?.name || ''),
        location: String(scrapedData.organization?.location || ''),
      };

      const postedTimeAgo = String(scrapedData.posted_time_ago || 'N/A');

      this.logger.log(
        `Organization data for storage: ${JSON.stringify(organization)}`,
      );
      this.logger.log(`Posted time ago for storage: ${postedTimeAgo}`);

      try {
        await this.drizzle.transaction(async (tx) => {
          this.logger.log(`Inserting job into linkedinJobs table...`);

          try {
            const orgObject = JSON.parse(JSON.stringify(organization));
            this.logger.debug(
              `Organization object after JSON stringify/parse: ${JSON.stringify(
                orgObject,
              )}`,
            );

            const orgJsonb = orgObject as unknown as JSON;

            const insertValues = {
              linkedinJobId: linkedinJobId,
              jobInfo: jobDescriptionText,
              processedSkills: processedJobData as unknown as JSON,
              organization: orgJsonb,
              postedTimeAgo: postedTimeAgo,
            } as NewLinkedinJob;

            this.logger.debug(
              `Insert values prepared: ${JSON.stringify({
                linkedinJobId,
                jobInfoLength: jobDescriptionText.length,
                hasProcessedSkills: !!processedJobData,
                organization: orgObject,
                postedTimeAgo,
              })}`,
            );

            const [jobPost] = await tx
              .insert(linkedinJobs)
              .values(insertValues)
              .onConflictDoUpdate({
                target: linkedinJobs.linkedinJobId,
                set: {
                  jobInfo: jobDescriptionText,
                  processedSkills: processedJobData as unknown as JSON,
                  organization: orgJsonb,
                  postedTimeAgo: postedTimeAgo,
                  updatedAt: new Date(),
                } as Partial<NewLinkedinJob>,
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
          } catch (txError) {
            this.logger.error(
              `Transaction error: ${txError.message}`,
              txError.stack,
            );
            throw txError;
          }
        });
      } catch (dbError) {
        this.logger.error(
          `Database error during transaction: ${dbError.message}`,
          dbError.stack,
        );
        throw dbError;
      }

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
