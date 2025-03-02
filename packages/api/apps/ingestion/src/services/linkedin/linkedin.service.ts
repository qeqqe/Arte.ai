import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';

@Injectable()
export class LinkedinService {
  private readonly logger = new Logger(LinkedinService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async scrapeJob(jobId: string): Promise<string> {
    try {
      const PYTHON_API_URL =
        this.configService.getOrThrow<string>('PYTHON_URL');
      this.logger.log(
        `Sending request to Python service: ${PYTHON_API_URL}/scrape-job?jobId=${jobId}`,
      );

      const resp = await firstValueFrom(
        this.httpService
          .get(`${PYTHON_API_URL}/scrape-job`, {
            params: {
              jobId: jobId,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(`Error from Python service: ${error.message}`);
              if (error.response) {
                this.logger.error(
                  `Response error data: ${JSON.stringify(error.response.data)}`,
                );
                this.logger.error(`Response status: ${error.response.status}`);
              }
              throw new InternalServerErrorException(
                `Failed to fetch job data: ${error.message}`,
              );
            }),
          ),
      );

      if (!resp.data || !resp.data.md) {
        this.logger.warn(`No markdown content returned for job ID: ${jobId}`);
        throw new NotFoundException('No job content found');
      }

      return resp.data.md as string;
    } catch (err) {
      this.logger.error(`Error in scrapeJob: ${err.message}`);
      if (
        err instanceof NotFoundException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }
      throw new NotFoundException('Job not found');
    }
  }
}
