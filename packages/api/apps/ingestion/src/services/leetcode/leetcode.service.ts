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
import { UserPayload, DRIZZLE_PROVIDER, users } from '@app/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  NewUserLeetcode,
  ProcessedLeetcodeStat,
  UserLeetcodeSchema,
} from '@app/common/leetcode';
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

      const proccessedLeetcodeStat = this.proccessLeetcodeStat({
        totalQuestions,
        totalSolved,
        easySolved,
        mediumSolved,
        hardSolved,
        acceptanceRate,
        ranking,
      });

      try {
        const leetcodeData: NewUserLeetcode = {
          userId: user.id,
          leetcodeUsername: username,
          totalSolved,
          totalQuestions,
          easySolved,
          mediumSolved,
          proccessedLeetcodeStat,
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
              proccessedLeetcodeStat,
              hardSolved,
              acceptanceRate,
              ranking,
            })
            .where(eq(UserLeetcodeSchema.userId, user.id));

          this.updateOnboading(user.id);
        } else {
          this.logger.log(`Inserting new LeetCode data for user ${user.id}`);
          await this.drizzle.insert(UserLeetcodeSchema).values(leetcodeData);
          this.updateOnboading(user.id);
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
        proccessedLeetcodeStat,
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

  proccessLeetcodeStat(leetcodeStat: {
    totalQuestions: number;
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    acceptanceRate: number;
    ranking: number;
  }): ProcessedLeetcodeStat {
    try {
      const {
        totalQuestions,
        totalSolved,
        easySolved,
        mediumSolved,
        hardSolved,
        acceptanceRate,
        ranking,
      } = leetcodeStat;

      if (totalQuestions == 0 || ranking == 0) {
        return {
          rating: 0,
          level: 'Unknown',
          details: {
            totalSolved,
            totalQuestions,
            easySolved,
            mediumSolved,
            hardSolved,
            acceptanceRate: acceptanceRate * 100,
            ranking,
          },
        };
      }

      const weightedSolved = easySolved * 1 + mediumSolved * 3 + hardSolved * 6;
      const logBase = 1.1;
      const difficulty_scale = 30 * (1 - 1 / logBase ** (weightedSolved / 100));

      const mediumRatio = mediumSolved / Math.max(1, totalSolved);
      const hardRatio = hardSolved / Math.max(1, totalSolved);
      const difficultyBonus = mediumRatio * 10 + hardRatio * 15;

      const breadthScale = 20 * (1 - 1 / logBase ** (totalSolved / 50));
      const breadthScore = Math.min(20, breadthScale);

      const difficultyScore = Math.min(50, difficulty_scale + difficultyBonus);

      const qualityScore = Math.min(15, acceptanceRate * 15);

      let standingScore = 0;
      if (ranking <= 5000) {
        standingScore = 15; // top 5K users get full score
      } else if (ranking <= 50000) {
        standingScore = 12 + 3 * (1 - (ranking - 5000) / 45000);
      } else if (ranking <= 200000) {
        standingScore = 8 + 4 * (1 - (ranking - 50000) / 150000);
      } else {
        standingScore = 8 * (1 - Math.min(1, (ranking - 200000) / 800000));
      }

      let finalScore = Math.round(
        difficultyScore + breadthScore + qualityScore + standingScore,
      );

      let level = 'Novice';

      if (finalScore >= 85) {
        level = 'Expert';
      } else if (finalScore >= 70) {
        level = 'Advanced';
      } else if (finalScore >= 50) {
        level = 'Intermediate';
      } else if (finalScore >= 30) {
        level = 'Beginner';
      }

      if (totalSolved >= 500 && !['Advanced', 'Expert'].includes(level)) {
        level = 'Advanced';
        if (finalScore < 70) {
          finalScore = 70;
        }
      } else if (
        totalSolved >= 300 &&
        !['Intermediate', 'Advanced', 'Expert'].includes(level)
      ) {
        level = 'Intermediate';
        if (finalScore < 50) {
          finalScore = 50;
        }
      } else if (totalSolved >= 100 && level === 'Novice') {
        level = 'Beginner';
        if (finalScore < 30) {
          finalScore = 30;
        }
      }

      return {
        rating: finalScore,
        level: level,
        details: {
          totalSolved: totalSolved,
          totalQuestions: totalQuestions,
          easySolved: easySolved,
          mediumSolved: mediumSolved,
          hardSolved: hardSolved,
          acceptanceRate: acceptanceRate * 100,
          ranking: ranking,
          components: {
            difficultyScore: Math.round(difficultyScore),
            breadthScore: Math.round(breadthScore),
            qualityScore: Math.round(qualityScore),
            standingScore: Math.round(standingScore),
          },
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to proccess leetcode data: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async updateOnboading(userId) {
    try {
      const [userStatus] = await this.drizzle
        .select({ onboardingStatus: users.onboardingStatus })
        .from(users)
        .where(eq(users.id, userId));

      if (userStatus) {
        const currentStatus =
          typeof userStatus.onboardingStatus === 'object'
            ? userStatus.onboardingStatus
            : {};
        await this.drizzle
          .update(users)
          .set({
            onboardingStatus: {
              ...currentStatus,
              leetcode: true,
            },
          })
          .where(eq(users.id, userId));
      }
    } catch (error: any) {
      this.logger.error(
        `Unable to update the onboarding status for the user ${userId}`,
      );
    }
  }
}
