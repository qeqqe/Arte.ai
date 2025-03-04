import { userGithubSchema } from '@app/common/github';
import { DRIZZLE_PROVIDER } from '@app/common';
import { HttpService } from '@nestjs/axios';
import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { Logger } from 'nestjs-pino';

@Injectable()
export class GithubService {
  private readonly githubGraphQLEndpoint = 'https://api.github.com/graphql';
  constructor(
    private readonly logger: Logger,
    private readonly httpService: HttpService,
    @Inject(DRIZZLE_PROVIDER) private readonly drizzle: NodePgDatabase,
  ) {}

  async getTopRepo(userId: string): Promise<any> {
    const { username, access_token } = await this.fetchUserInfo(userId);
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
      Authorization: `bearer ${access_token}`,
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
      this.logger.error(`Error fetching GitHub data: ${error}`);
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
      this.logger.error(`GitHub information not found for user ${userId}`);
      throw new Error(`GitHub information not found for user ${userId}`);
    }

    return {
      username: userGithub.username,
      access_token: userGithub.accessToken,
    };
  }
}
