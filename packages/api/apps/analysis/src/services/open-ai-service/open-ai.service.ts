import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import OpenAI from 'openai';
import { OnModuleInit } from '@nestjs/common';
import { SkillsData } from '../../types/skills.types';

@Injectable()
export class OpenAi implements OnModuleInit {
  private client: OpenAI;
  private readonly EMBEDDING_DIMENSION: number;
  private readonly BATCH_SIZE = 5;
  private readonly BATCH_DELAY_MS = 200;
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
    this.EMBEDDING_DIMENSION = this.configService.get<number>(
      'EMBEDDING_DIMENSION',
      1536,
    );
  }

  async onModuleInit() {
    this.client = new OpenAI({
      apiKey: this.configService.getOrThrow<string>('OPENAI_API_KEY'),
      baseURL: this.configService.getOrThrow<string>('BASE_URL'),
      timeout: 60000, // to avoid rate limiting (15 req/min)
      maxRetries: 3,
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      this.logger.log(`generating embedding for text of length ${text.length}`);
      const startTime = Date.now();

      const response = await this.client.embeddings.create({
        model: this.configService.get<string>(
          'EMBED_MODEL',
          'text-embedding-3-large',
        ),
        input: text,
      });

      this.logger.log(`embedding generated in ${Date.now() - startTime}ms`);
      return response.data[0].embedding;
    } catch (error) {
      this.logger.error(
        `embedding generation error: ${error.message}`,
        error.stack,
      );
    }
  }

  async generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    try {
      const validTexts = texts.filter((text) => text && text.trim() !== '');
      if (validTexts.length === 0) {
        return [];
      }

      this.logger.log(
        `starting batch embedding generation for ${validTexts.length} texts`,
      );
      const startTime = Date.now();

      // using small batch size to prevent timeouts important for large datasets for future use
      const batchSize = this.BATCH_SIZE;
      const allEmbeddings: number[][] = [];

      for (let i = 0; i < validTexts.length; i += batchSize) {
        const batch = validTexts.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(validTexts.length / batchSize);

        this.logger.log(
          `processing embedding batch ${batchNumber}/${totalBatches}`,
        );
        const batchStart = Date.now();

        try {
          // process batch
          const response = await this.client.embeddings.create({
            model: this.configService.get<string>(
              'EMBED_MODEL',
              'text-embedding-3-large',
            ),
            input: batch,
          });

          // add embeddings to our results
          const batchEmbeddings = response.data.map((item) => item.embedding);
          allEmbeddings.push(...batchEmbeddings);

          this.logger.log(
            `batch ${batchNumber}/${totalBatches} completed in ${
              Date.now() - batchStart
            }ms`,
          );

          // small delay btwn batches to avoid rate limiting
          if (i + batchSize < validTexts.length) {
            await new Promise((resolve) =>
              setTimeout(resolve, this.BATCH_DELAY_MS),
            );
          }
        } catch (batchError) {
          this.logger.error(
            `batch ${batchNumber}/${totalBatches} failed: ${batchError.message}`,
            batchError.stack,
          );

          // process each text individually as fallback
          this.logger.log(
            `attempting individual processing for batch ${batchNumber}`,
          );

          for (const text of batch) {
            try {
              const embedding = await this.generateEmbedding(text);
              allEmbeddings.push(embedding);
            } catch (individualError) {
              this.logger.error(
                `individual embedding failed: ${individualError.message}`,
              );
              allEmbeddings.push(
                Array(this.EMBEDDING_DIMENSION)
                  .fill(0)
                  .map(() => Math.random() - 0.5),
              );
            }

            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
      }

      this.logger.log(
        `batch embedding generation completed in ${
          Date.now() - startTime
        }ms for ${allEmbeddings.length} embeddings`,
      );

      return allEmbeddings;
    } catch (error) {
      this.logger.error(`batch embedding error: ${error.message}`, error.stack);
      throw new Error(`failed to generate batch embeddings: ${error.message}`);
    }
  }

  async extractSkills(jobPosting: string): Promise<SkillsData> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.configService.get<string>('MODEL', 'gpt-4o'),
        messages: [
          {
            role: 'system',
            content: `You are a job skills extraction assistant. Analyze the job posting and extract all technical skills mentioned, categorizing them into the following categories:
            - languages
            - frontend_frameworks_libraries
            - frontend_styling_ui
            - backend_frameworks_runtime
            - databases_datastores
            - database_tools_orms
            - cloud_platforms
            - devops_cicd
            - infrastructure_as_code_config
            - monitoring_observability
            - ai_ml_datascience
            - mobile_development
            - testing_quality
            - apis_communication
            - architecture_design_patterns
            - security
            - methodologies_collaboration
            - operating_systems
            - web_servers_proxies
            - other_technologies_concepts
            - brief_job_description
            
            Format your response as a valid JSON object with these category names as keys and arrays of string values.
            If a category has no skills, provide an empty array.`,
          },
          {
            role: 'user',
            content: jobPosting,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('no content returned from OpenAI');
      }

      return JSON.parse(content) as SkillsData;
    } catch (error) {
      this.logger.error(
        `error extracting skills: ${error.message}`,
        error.stack,
      );
      throw new Error(`failed to extract skills: ${error.message}`);
    }
  }
}
