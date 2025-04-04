import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import OpenAI from 'openai';
import { OnModuleInit } from '@nestjs/common';
import { SkillsData } from '../../types/skills.types';

@Injectable()
export class OpenAi implements OnModuleInit {
  private client: OpenAI;
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.client = new OpenAI({
      apiKey: this.configService.getOrThrow<string>('OPENAI_API_KEY'),
      baseURL: this.configService.getOrThrow<string>('BASE_URL'),
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
