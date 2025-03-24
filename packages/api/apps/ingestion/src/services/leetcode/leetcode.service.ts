import { LeetcodeFetchResponse } from '../../controllers/leetcode/leetcode.controller';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UserPayload, DRIZZLE_PROVIDER } from '@app/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { NewUserLeetcode, UserLeetcodeSchema } from '@app/common/leetcode';
import { catchError } from 'rxjs/operators';
import { eq } from 'drizzle-orm';

@Injectable()
export class LeetcodeService {
  private readonly logger = new Logger(LeetcodeService.name);

  constructor(
    private httpService: HttpService,
    @Inject(DRIZZLE_PROVIDER) private readonly drizzle: NodePgDatabase,
  ) {}

  async fetchData(
    username: string,
    user: UserPayload,
  ): Promise<LeetcodeFetchResponse> {
    if (!username || typeof username !== 'string') {
      throw new BadRequestException('Username must be a non-empty string');
    }

    try {
      const graphqlEndpoint = 'https://leetcode.com/graphql/';

      const query = {
        query: `query getUserProfile($username: String!) {
          allQuestionsCount {
            difficulty
            count
          }
          matchedUser(username: $username) {
            contributions {
              points
            }
            profile {
              reputation
              ranking
            }
            submissionCalendar
            submitStats {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
              totalSubmissionNum {
                difficulty
                count
                submissions
              }
            }
          }
        }`,
        variables: {
          username,
        },
      };

      this.logger.log(`Fetching LeetCode data for username: ${username}`);

      const response = await firstValueFrom(
        this.httpService
          .post(graphqlEndpoint, query, {
            headers: {
              'Content-Type': 'application/json',
              Referer: `https://leetcode.com/${username}/`,
            },
          })
          .pipe(
            catchError((error) => {
              if (error?.response?.status === 404) {
                throw new NotFoundException(
                  `LeetCode username '${username}' not found`,
                );
              }
              this.logger.error(`API error: ${error.message}`, error.stack);
              throw new InternalServerErrorException(
                `Failed to fetch LeetCode data: ${error.message}`,
              );
            }),
          ),
      );

      // parse gQL response
      const data = response.data;
      if (!data || !data.data || !data.data.matchedUser) {
        throw new NotFoundException(
          `LeetCode username '${username}' not found`,
        );
      }

      // relevant data from the GraphQL response
      const matchedUser = data.data.matchedUser;
      const submitStats = matchedUser.submitStats;
      const acSubmissions = submitStats.acSubmissionNum;
      const totalQuestions = data.data.allQuestionsCount.reduce(
        (sum, item) => sum + item.count,
        0,
      );

      // find submissions by difficulty
      const totalSolved =
        acSubmissions.find((s) => s.difficulty === 'All')?.count || 0;
      const easySolved =
        acSubmissions.find((s) => s.difficulty === 'Easy')?.count || 0;
      const mediumSolved =
        acSubmissions.find((s) => s.difficulty === 'Medium')?.count || 0;
      const hardSolved =
        acSubmissions.find((s) => s.difficulty === 'Hard')?.count || 0;

      // lc calculates acceptance rate as: (accepted submissions / total submissions) * 100
      const acceptedSubmissions =
        acSubmissions.find((s) => s.difficulty === 'All')?.submissions || 0;
      const totalSubmissions =
        submitStats.totalSubmissionNum.find((s) => s.difficulty === 'All')
          ?.submissions || 0;

      const acceptanceRate =
        totalSubmissions > 0
          ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
          : 0;

      this.logger.log(
        `Calculated acceptance rate: ${acceptanceRate}% (${acceptedSubmissions}/${totalSubmissions})`,
      );

      const ranking = matchedUser.profile.ranking || 0;

      try {
        const leetcodeData: NewUserLeetcode = {
          userId: user.id,
          leetcodeUsername: username,
          totalSolved,
          totalQuestions,
          easySolved,
          mediumSolved,
          hardSolved,
          acceptanceRate,
          ranking,
        };

        const existingRecord = await this.drizzle
          .select()
          .from(UserLeetcodeSchema)
          .where(eq(UserLeetcodeSchema.userId, user.id))
          .limit(1);

        if (existingRecord.length > 0) {
          this.logger.log(
            `Updating existing LeetCode data for user ${user.id}`,
          );

          await this.drizzle
            .update(UserLeetcodeSchema)
            .set({
              leetcodeUsername: username,
              totalSolved,
              totalQuestions,
              easySolved,
              mediumSolved,
              hardSolved,
              acceptanceRate,
              ranking,
            })
            .where(eq(UserLeetcodeSchema.userId, user.id));
        } else {
          this.logger.log(`Inserting new LeetCode data for user ${user.id}`);
          await this.drizzle.insert(UserLeetcodeSchema).values(leetcodeData);
        }

        this.logger.log(
          `Saved LeetCode data for user ${user.id} with username ${username}`,
        );
      } catch (dbError) {
        this.logger.error(`Database error: ${dbError.message}`, dbError.stack);
        if (dbError.code) {
          this.logger.error(`PostgreSQL error code: ${dbError.code}`);
          if (dbError.detail) {
            this.logger.error(`PostgreSQL detail: ${dbError.detail}`);
          }
          if (dbError.query) {
            this.logger.error(`Query that caused the error: ${dbError.query}`);
          }
        }
        throw new InternalServerErrorException('Failed to save LeetCode data');
      }

      return {
        totalSolved,
        totalQuestions,
        easySolved,
        mediumSolved,
        hardSolved,
        acceptanceRate,
        ranking,
      };
    } catch (err) {
      // Allow NotFoundException to propagate
      if (err instanceof NotFoundException) {
        throw err;
      }

      if (err.isAxiosError) {
        this.logger.error(`API error: ${err.message}`, err.stack);

        if (err?.response?.status === 404) {
          throw new NotFoundException(
            `LeetCode username '${username}' not found`,
          );
        }
      }

      this.logger.error(`Unhandled error: ${err.message}`, err.stack);
      throw new InternalServerErrorException(
        `Failed to process LeetCode data: ${err.message}`,
      );
    }
  }
}
