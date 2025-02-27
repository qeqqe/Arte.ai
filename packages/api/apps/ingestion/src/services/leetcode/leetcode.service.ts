import { LeetcodeFetchResponse } from '@app/dtos/leetcode';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    private readonly configService: ConfigService,
    private httpService: HttpService,
    @Inject(DRIZZLE_PROVIDER) private readonly drizzle: NodePgDatabase,
  ) {
    const url = this.configService.getOrThrow<string>('LEETCODE_FETCH_URL');
    this.logger.log(`LeetCode API URL: ${url || 'NOT SET'}`);
  }

  async fetchData(
    username: string,
    user: UserPayload,
  ): Promise<LeetcodeFetchResponse> {
    if (!username || typeof username !== 'string') {
      throw new BadRequestException('Username must be a non-empty string');
    }

    const leetcodeUrl = this.configService.get<string>('LEETCODE_FETCH_URL');
    this.logger.log(`Using LeetCode API URL: ${leetcodeUrl}`);

    if (!leetcodeUrl) {
      this.logger.error('LEETCODE_FETCH_URL environment variable is not set');
      throw new InternalServerErrorException(
        'LeetCode API URL is not configured',
      );
    }

    try {
      const formattedUrl = leetcodeUrl.endsWith('/')
        ? `${leetcodeUrl}${username}`
        : `${leetcodeUrl}/${username}`;

      this.logger.log(`Fetching data from ${formattedUrl}`);

      const response = await firstValueFrom(
        this.httpService.get(formattedUrl).pipe(
          catchError((error) => {
            this.logger.error(
              `HTTP request failed: ${error.message}`,
              error.stack,
            );
            if (error.response) {
              this.logger.error(`Response status: ${error.response.status}`);
              this.logger.error(
                `Response data: ${JSON.stringify(error.response.data)}`,
              );
            }
            throw error;
          }),
        ),
      );

      this.logger.log(`Successfully fetched data for ${username}`);
      this.logger.log(`Response data: ${JSON.stringify(response.data)}`);

      if (!response.data || !response.data.totalSolved) {
        this.logger.error(
          `Invalid response format: ${JSON.stringify(response.data)}`,
        );
        throw new InternalServerErrorException(
          'Invalid response from LeetCode API',
        );
      }

      try {
        // Convert string values to numbers where needed
        const leetcodeData: NewUserLeetcode = {
          totalSolved: Number(response.data.totalSolved),
          userId: user.id,
          leetcodeUsername: username,
          totalQuestions: Number(response.data.totalQuestions),
          easySolved: Number(response.data.easySolved),
          mediumSolved: Number(response.data.mediumSolved),
          hardSolved: Number(response.data.hardSolved),
          acceptanceRate: Number(response.data.acceptanceRate),
          ranking: Number(response.data.ranking),
        };

        // Log the converted data
        this.logger.log(
          `Processed LeetCode data: ${JSON.stringify(leetcodeData)}`,
        );

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
              totalSolved: Number(response.data.totalSolved),
              totalQuestions: Number(response.data.totalQuestions),
              easySolved: Number(response.data.easySolved),
              mediumSolved: Number(response.data.mediumSolved),
              hardSolved: Number(response.data.hardSolved),
              acceptanceRate: Number(response.data.acceptanceRate),
              ranking: Number(response.data.ranking),
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

      return response.data;
    } catch (err) {
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
