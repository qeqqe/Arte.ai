import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
  Inject,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ParsedResumeResponse } from '../../types/resume.types';
import { promiseRetry } from '../../utils/promise-retry';
import { DRIZZLE_PROVIDER } from '@app/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users } from '@app/common/user/user.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ResumeService {
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(DRIZZLE_PROVIDER)
    private readonly drizzle: NodePgDatabase,
  ) {}

  async handleFileUpload(
    file: Express.Multer.File,
    userId: string,
  ): Promise<ParsedResumeResponse> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.isValidPDF(file)) {
      throw new BadRequestException('Invalid PDF file');
    }

    try {
      const text = await this.extractTextWithRetry(file);

      await this.storeResumeText(userId, text);

      this.logger.log('Successfully parsed and stored PDF', {
        fileSize: file.size,
        fileName: file.originalname,
        userId,
      });

      return { text };
    } catch (error) {
      this.logger.error('Failed to process PDF', {
        error: error.message,
        stack: error.stack,
        fileName: file.originalname,
        userId,
      });
      throw new ServiceUnavailableException(
        'Failed to process resume. Please try again.',
      );
    }
  }

  async uploadResumeText(text: string, userId: string): Promise<void> {
    if (typeof text !== 'string') {
      this.logger.error('Received non-string type for resume text', {
        userId,
        receivedType: typeof text,
      });
      throw new BadRequestException('Invalid resume text format received.');
    }

    if (text.trim().length === 0 || text.length > 4000) {
      throw new BadRequestException(
        'Resume text cannot be empty or exceed 4000 characters',
      );
    }

    try {
      await this.storeResumeText(userId, text);
      this.logger.log('Successfully stored resume text', { userId });
    } catch (error) {
      this.logger.error('Failed to store resume text', {
        error: error.message,
        userId,
      });
      throw new ServiceUnavailableException(
        'Failed to store resume text. Please try again.',
      );
    }
  }

  private async storeResumeText(userId: string, text: string): Promise<void> {
    try {
      const result = await this.drizzle
        .update(users)
        .set({
          resume: text,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      if (!result.length) {
        throw new Error(`User with ID ${userId} not found`);
      }

      this.logger.log('Resume text stored in database', { userId });
    } catch (error) {
      this.logger.error('Failed to store resume text', {
        error: error.message,
        userId,
      });
      throw new Error('Failed to store resume text in database');
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
