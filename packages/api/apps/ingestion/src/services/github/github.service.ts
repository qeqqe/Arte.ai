import { userGithubSchema, userPinnedRepo } from '@app/common/github';
import { HttpService } from '@nestjs/axios';
import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { Logger } from 'nestjs-pino';
import { TopRepository } from '../../types/github-repo.types';
import { DRIZZLE_PROVIDER } from '@app/common/drizzle';

@Injectable()
export class GithubService {
  private readonly githubGraphQLEndpoint = 'https://api.github.com/graphql';
  constructor(
    private readonly logger: Logger,
    private readonly httpService: HttpService,
    @Inject(DRIZZLE_PROVIDER) private readonly drizzle: NodePgDatabase,
  ) {}

  async getUserRepoData(userId: string): Promise<TopRepository[]> {
    try {
      // Get user GitHub info (username and access token)
      const { username, access_token } = await this.fetchUserInfo(userId);

      // Fetch pinned repositories using GraphQL API
      const pinnedRepos = await this.fetchPinnedRepositories(
        username,
        access_token,
      );

      // Process and store repository data with additional information
      const data = await this.processAndStoreRepositories(pinnedRepos, userId);

      return data;
    } catch (error) {
      this.logger.error(`Failed to process GitHub repo data: ${error.message}`);
      throw error;
    }
  }

  private async fetchUserInfo(userId: string): Promise<{
    username: string;
    access_token: string;
  }> {
    const userGithubResults = await this.drizzle
      .select()
      .from(userGithubSchema)
      .where(eq(userGithubSchema.userId, userId));

    const userGithub = userGithubResults[0];

    if (!userGithub) {
      throw new Error(`GitHub information not found for user ${userId}`);
    }

    return {
      username: userGithub.username,
      access_token: userGithub.accessToken,
    };
  }

  private async fetchPinnedRepositories(
    username: string,
    accessToken: string,
  ): Promise<TopRepository[]> {
    const query = `
      query { 
        user(login: "${username}") {
          pinnedItems(first: 6, types: REPOSITORY) {
            nodes {
              ... on Repository {
                name
                url
                description
                stargazerCount
                forkCount
                primaryLanguage {
                  name
                }
                repositoryTopics(first: 5) {
                  nodes {
                    topic {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const headers = {
      Authorization: `bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await this.httpService.axiosRef.post(
        this.githubGraphQLEndpoint,
        JSON.stringify({ query }),
        { headers },
      );

      return response.data.data.user.pinnedItems.nodes;
    } catch (error) {
      this.logger.error(`Error fetching GitHub pinned repositories: ${error}`);
      throw new Error(
        `Failed to fetch GitHub pinned repositories: ${error.message}`,
      );
    }
  }

  private async processAndStoreRepositories(
    repos: TopRepository[],
    userId: string,
  ): Promise<any[]> {
    const results = [];

    this.logger.log(
      `Processing ${repos.length} repositories for user ${userId}`,
    );

    // Process each repository sequentially to avoid overwhelming APIs
    for (const repo of repos) {
      try {
        // extract username and repo name from URL
        const urlParts = repo.url.split('/');
        const username = urlParts[urlParts.length - 2];
        const repoName = urlParts[urlParts.length - 1];

        // Fetch rest of the data for repository
        const languages = await this.fetchLanguages(username, repoName);
        const readme = await this.fetchReadme(username, repoName);

        const repoData = {
          name: repo.name,
          url: repo.url,
          description: repo.description || 'No description',
          stargazerCount: repo.stargazerCount,
          forkCount: repo.forkCount,
          primaryLanguage: repo.primaryLanguage?.name || 'Unknown',
          repositoryTopics: JSON.stringify(
            repo.repositoryTopics.nodes.map((node) => node.topic.name),
          ),
          languages: JSON.stringify(languages || {}),
          readme: readme || 'No readme.md exists',
          userId: userId,
        };

        // Insert repo and collect the result
        const insertResult = await this.drizzle
          .insert(userPinnedRepo)
          .values(repoData)
          .returning();

        // Add to results array
        if (insertResult && insertResult.length > 0) {
          results.push(insertResult[0]);
        }
      } catch (error) {
        this.logger.error(
          `Error processing repo ${repo.name}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `Successfully processed ${results.length} out of ${repos.length} repositories`,
    );
    return results;
  }

  private async fetchLanguages(
    username: string,
    repoName: string,
  ): Promise<Record<string, number> | null> {
    try {
      const response = await this.httpService.axiosRef.get(
        `https://api.github.com/repos/${username}/${repoName}/languages`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Error fetching languages for ${username}/${repoName}: ${error.message}`,
      );
      return null;
    }
  }

  private async fetchReadme(
    username: string,
    repoName: string,
  ): Promise<string | null> {
    try {
      const response = await this.httpService.axiosRef.get(
        `https://api.github.com/repos/${username}/${repoName}/readme`,
      );

      if (response.status === 404) {
        return null;
      }

      const content = Buffer.from(
        response.data.content,
        response.data.encoding,
      ).toString('utf-8');

      return content;
    } catch (error) {
      this.logger.error(
        `Error fetching readme for ${username}/${repoName}: ${error.message}`,
      );
      return null;
    }
  }
}
