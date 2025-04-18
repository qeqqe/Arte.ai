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
            - other_relevent_info
            
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
        this.logger.error(
          `Falied to proccess the result for the job post ${jobPosting.slice(
            20,
          )}`,
        );
        throw new Error('no content returned from OpenAI');
      }
      this.logger.log(`Proccessed job analysis: \n ${content}`);
      return JSON.parse(content) as SkillsData;
    } catch (error) {
      this.logger.error(
        `error extracting skills: ${error.message}`,
        error.stack,
      );
      throw new Error(`failed to extract skills: ${error.message}`);
    }
  }

  async proccessUserInfo(
    mappeduserPinnedRepoResults,
    resume,
    userProcessedLeetcodeStat,
  ): Promise<any> {
    try {
      const prompt = this.processedUserSkillsPromptBuilder(
        mappeduserPinnedRepoResults,
        resume,
        userProcessedLeetcodeStat,
      );

      this.logger.log(
        `Userinfo: \n
         mappeduserPinnedRepoResults: ${mappeduserPinnedRepoResults} \n
          resume: ${resume} \n
          userProcessedLeetcodeStat: ${userProcessedLeetcodeStat} \n
         `,
      );

      const response = await this.client.chat.completions.create({
        model: this.configService.get<string>('MODEL', 'gpt-4o'),
        messages: [
          {
            role: 'system',
            content: `You are a developer skills extraction assistant. You have to analyze user data and response with:
            Extract and categorize all technical skills into the following categories:
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
                    
            For each skill found, include:
            1. The skill name
            2. A proficiency score (0-10) - for user profiles only
            3. Evidence source (which part of the data it was found in)
                    
            Additionally, provide:
            - brief_description: A concise summary of the developer's expertise
            }
            - key_strengths: The top 3-5 areas where the developer demonstrates strength
            - skill_gaps: Common skills missing from the developer's profile
                    
            Format your response as a valid JSON object with these category names as keys. If a category has no skills, provide an empty array.
            Ensure the final output is properly formatted, valid JSON.
            Avoid any speculative or subjective statements.
            `,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
      });
      const content = response.choices[0].message.content;
      if (!content) {
        this.logger.error('no content returned');
        throw new Error('no content returned');
      }

      this.logger.log(`Get the response: \n ${content}`);
      return JSON.parse(content);
    } catch (error) {
      this.logger.error(
        `error extracting skills: ${error.message}`,
        error.stack,
      );
      throw new Error(`failed to extract skills: ${error.message}`);
    }
  }

  private processedUserSkillsPromptBuilder(
    mappeduserPinnedRepoResults,
    resume,
    userProcessedLeetcodeStat,
  ): string {
    return `Analyze the following developer data and create a comprehensive skill profile:

  ## LeetCode Data
  ${JSON.stringify(userProcessedLeetcodeStat, null, 2)}

  ## Resume Data
  ${JSON.stringify(resume, null, 2)}

  ## GitHub Repository Data
  ${JSON.stringify(mappeduserPinnedRepoResults, null, 2)}

  Based on this data, create a detailed profile of this developer.
`;
  }
  async generateSkillGapAnalysis(
    candidateSkills: any,
    jobRequirements: any,
    additionalContext?: string,
  ): Promise<string> {
    this.logger.debug('Sending request to GitHub marketplace models');
    const model = this.configService.get<string>('MODEL', 'gpt-4o');

    try {
      const prompt = this.buildSkillGapPrompt(
        candidateSkills,
        jobRequirements,
        additionalContext,
      );

      this.logger.debug(`Using model: ${model}`);
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are a skilled career advisor and technical skills expert. ALSO PROVIDE ALL THE RESPONSE UNDER 2000 TOKENS',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 2000,
        top_p: 1,
        response_format: { type: 'json_object' },
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
}
