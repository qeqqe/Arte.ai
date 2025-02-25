import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ParsedResumeResponse } from '../../types/resume.types';
import { promiseRetry } from '../../utils/promise-retry';

@Injectable()
export class ResumeService {
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async handleFileUpload(
    file: Express.Multer.File,
  ): Promise<ParsedResumeResponse> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.isValidPDF(file)) {
      throw new BadRequestException('Invalid PDF file');
    }

    try {
      const text = await this.extractTextWithRetry(file);

      this.logger.log('Successfully parsed PDF', {
        fileSize: file.size,
        fileName: file.originalname,
      });

      return { text };
    } catch (error) {
      this.logger.error('Failed to process PDF', {
        error: error.message,
        stack: error.stack,
        fileName: file.originalname,
      });
      throw new ServiceUnavailableException(
        'Failed to process resume. Please try again.',
      );
    }
  }

  private async extractTextWithRetry(
    file: Express.Multer.File,
  ): Promise<string> {
    return promiseRetry(
      async () => {
        const formData = new FormData();
        formData.append('file', new Blob([file.buffer]), file.originalname);

        const pythonUrl = this.configService.get(
          'PYTHON_URL',
          'http://python-service:5000',
        );
        const response = await firstValueFrom(
          this.httpService.post<{ text: string }>(
            `${pythonUrl}/parse-pdf`,
            formData,
          ),
        );

        if (!response.data?.text) {
          throw new Error('Invalid response from Python service');
        }

        return response.data.text;
      },
      {
        retries: 3,
        minTimeout: 1000,
        maxTimeout: 3000,
        onRetry: (error, attempt) => {
          this.logger.warn('Retrying PDF parse', {
            attempt,
            error: error.message,
          });
        },
      },
    );
  }

  private isValidPDF(file: Express.Multer.File): boolean {
    return (
      file.mimetype === 'application/pdf' &&
      file.size > 0 &&
      file.size < 5 * 1024 * 1024
    );
  }
}
