import { Test, TestingModule } from '@nestjs/testing';
import { ResumeService } from './resume.service';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '@app/common';
import { users } from '@app/common/user/user.schema';
import { eq } from 'drizzle-orm';

// Mock the promise-retry util
jest.mock('../../utils/promise-retry', () => ({
  promiseRetry: (fn, options) => {
    // Actually retry the function call for the requested number of times
    return (async () => {
      let lastError;
      for (let attempt = 1; attempt <= options.retries + 1; attempt++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error;
          if (attempt <= options.retries && options.onRetry) {
            options.onRetry(error, attempt);
          }
        }
      }
      throw lastError;
    })();
  },
}));

describe('ResumeService', () => {
  let service: ResumeService;
  let mockHttpService: any;
  let mockDrizzle: any;
  let mockConfigService: any;
  let mockLogger: any;

  // Setup mock services
  const setupMocks = () => {
    mockHttpService = {
      post: jest.fn(),
    };

    mockDrizzle = {
      update: jest.fn(() => mockDrizzle),
      set: jest.fn(() => mockDrizzle),
      where: jest.fn(() => mockDrizzle),
      returning: jest.fn(() => Promise.resolve([{ id: 'user123' }])),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue('http://python-service:5000'),
    };

    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    setupMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeService,
        {
          provide: Logger,
          useValue: mockLogger,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: DRIZZLE_PROVIDER,
          useValue: mockDrizzle,
        },
      ],
    }).compile();

    service = module.get<ResumeService>(ResumeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleFileUpload', () => {
    const userId = 'user123';
    const validPdfFile = {
      originalname: 'resume.pdf',
      mimetype: 'application/pdf',
      size: 1024 * 100, // 100KB
      buffer: Buffer.from('test pdf content'),
    } as Express.Multer.File;

    it('should throw BadRequestException if no file is provided', async () => {
      await expect(
        service.handleFileUpload(null as any, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if file is not a PDF', async () => {
      const invalidFile = {
        ...validPdfFile,
        mimetype: 'text/plain',
      } as Express.Multer.File;

      await expect(
        service.handleFileUpload(invalidFile, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if file is too large', async () => {
      const largeFile = {
        ...validPdfFile,
        size: 6 * 1024 * 1024, // 6MB
      } as Express.Multer.File;

      await expect(service.handleFileUpload(largeFile, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should successfully process a valid PDF file', async () => {
      // Mock HTTP response
      mockHttpService.post.mockReturnValue(
        of({ data: { text: 'extracted resume text' } }),
      );

      const result = await service.handleFileUpload(validPdfFile, userId);

      // Verify HTTP call
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'http://python-service:5000/parse-pdf',
        expect.any(FormData),
      );

      // Verify database operations
      expect(mockDrizzle.update).toHaveBeenCalledWith(users);
      expect(mockDrizzle.set).toHaveBeenCalledWith({
        resume: 'extracted resume text',
        updatedAt: expect.any(Date),
      });
      expect(mockDrizzle.where).toHaveBeenCalledWith(eq(users.id, userId));

      // Verify the result
      expect(result).toEqual({ text: 'extracted resume text' });
    });

    it('should retry on Python service failure', async () => {
      // First call fails, second succeeds
      mockHttpService.post
        .mockImplementationOnce(() =>
          throwError(() => new Error('Server error')),
        )
        .mockImplementationOnce(() =>
          of({ data: { text: 'extracted after retry' } }),
        );

      const result = await service.handleFileUpload(validPdfFile, userId);

      // Should have been called twice due to retry
      expect(mockHttpService.post).toHaveBeenCalledTimes(2);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Retrying PDF parse',
        expect.any(Object),
      );
      expect(result).toEqual({ text: 'extracted after retry' });
    });

    // Increase timeout for the test that's timing out
    it('should throw ServiceUnavailableException after retries are exhausted', async () => {
      // All HTTP calls fail
      mockHttpService.post.mockImplementation(() =>
        throwError(() => new Error('Server error')),
      );

      await expect(
        service.handleFileUpload(validPdfFile, userId),
      ).rejects.toThrow(ServiceUnavailableException);

      // Should have been called 4 times (initial + 3 retries)
      expect(mockHttpService.post).toHaveBeenCalledTimes(4);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to process PDF',
        expect.objectContaining({
          error: expect.stringContaining('Server error'),
          fileName: validPdfFile.originalname,
          userId,
        }),
      );
    });

    it('should throw an error if Python service returns invalid response', async () => {
      // Mock invalid HTTP response
      mockHttpService.post.mockReturnValue(
        of({ data: { invalid: 'response' } }),
      );

      await expect(
        service.handleFileUpload(validPdfFile, userId),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining('Failed to process resume'),
        }),
      );
    });

    it('should throw an error if database update fails', async () => {
      mockHttpService.post.mockReturnValue(
        of({ data: { text: 'extracted resume text' } }),
      );

      mockDrizzle.returning.mockRejectedValue(new Error('Database error'));

      await expect(
        service.handleFileUpload(validPdfFile, userId),
      ).rejects.toThrow(ServiceUnavailableException);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to process PDF',
        expect.objectContaining({
          error: expect.stringContaining('Failed to store resume text'),
        }),
      );
    });
  });
});
