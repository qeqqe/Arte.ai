import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import OpenAI from 'openai';
import { OnModuleInit } from '@nestjs/common';
import { SkillsData } from '../../types/skills.types';
import { ScrapedJob } from '@app/common/jobpost';

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

  async extractSkills(jobPosting: ScrapedJob): Promise<SkillsData> {
    try {
      const jobContent = jobPosting.description
        ? jobPosting.description
        : jobPosting.md;
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
            content: jobContent,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        this.logger.error(
          `Falied to proccess the result for the job post ${jobContent.slice(
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
            content: `You are a developer skills extraction assistant. Analyze the user data and extract all technical skills, categorizing them into the following structure:

    {
      "languages": [],
      "frontend_frameworks_libraries": [],
      "frontend_styling_ui": [],
      "backend_frameworks_runtime": [],
      "databases_datastores": [],
      "database_tools_orms": [],
      "cloud_platforms": [],
      "devops_cicd": [],
      "infrastructure_as_code_config": [],
      "monitoring_observability": [],
      "ai_ml_datascience": [],
      "mobile_development": [],
      "testing_quality": [],
      "apis_communication": [],
      "architecture_design_patterns": [],
      "security": [],
      "methodologies_collaboration": [],
      "operating_systems": [],
      "web_servers_proxies": [],
      "other_technologies_concepts": [],
      "other_relevent_info": [],
      "brief_skill_description": []
    }

    For each skill found, include:
    1. The skill name
    2. A proficiency score (0-100) - for user profiles only
    3. Evidence source (which part of the data it was found in)

    Additionally, provide:
    - brief_job_description: A concise summary of the developer's expertise
    - other_relevent_info: Any other relevant information about the developer

    Format your response as a valid JSON object with exactly these keys. If a category has no skills, provide an empty array.
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
              'You are a skilled career advisor and technical skills expert.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
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
    
    ${additionalContext ? `## ADDITIONAL CONTEXT\n${additionalContext}\n` : ''}
    
    Analyze the gap between candidate skills and job requirements. For each skill:
    - Evaluate the candidate's proficiency level vs. required level
    - Calculate match percentage
    - Identify missing skills completely
    - Estimate time needed to close each gap
    - Suggest specific learning resources
    
    Return a JSON response with EXACTLY this structure:
    
    {
      "matchedSkills": [
        {
          "skill": "string", // Name of the skill
          "candidateLevel": number, // 0-5 scale
          "requiredLevel": number, // 0-5 scale
          "matchPercentage": number, // 0-100
          "details": "string" // Optional explanation
        }
      ],
      "gapAnalysis": [
        {
          "skill": "string", // Name of skill with gap
          "proficiencyGap": number, // Numerical gap
          "estimatedTimeToClose": {
            "value": number,
            "unit": "days"|"weeks"|"months"
          },
          "priority": "high"|"medium"|"low",
          "learningResources": [
            {
              "type": "course"|"book"|"documentation"|"project"|"other",
              "title": "string",
              "url": "string" // Optional
            }
          ]
        }
      ],
      "overallScore": {
        "value": number, // 0-100
        "category": "excellent"|"good"|"adequate"|"insufficient"
      },
      "recommendations": [
        {
          "focus": "string", // Skill or area to focus on
          "action": "string", // Specific action to take
          "timeframe": "string" // Optional
        }
      ],
      "insights": "string", // Overall insights
      "metadata": {
        "generatedAt": "string", // ISO timestamp
      }
    }

    Ensure all fields conform exactly to the specified types. Do not include additional fields or nested properties not specified in this schema.
  `;
  }
}
