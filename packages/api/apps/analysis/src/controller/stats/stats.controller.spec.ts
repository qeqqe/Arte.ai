import { Test, TestingModule } from '@nestjs/testing';
import { StatsController } from './stats.controller';
import { StatsService } from '../../services/stats/stats.service';
import { JwtAuthGuard } from '@app/common';
import { HttpException } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

describe('StatsController', () => {
  let controller: StatsController;

  const mockStatsService = {
    getUserSkillInfo: jest.fn(),
    getJobPostInfo: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        {
          provide: StatsService,
          useValue: mockStatsService,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<StatsController>(StatsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserSkillInfo', () => {
    it('should return user skill info when successful', async () => {
      const mockUserSkillData = { skills: { JavaScript: 80, TypeScript: 75 } };
      const mockRequest = { user: { id: 'user123' } };

      mockStatsService.getUserSkillInfo.mockResolvedValue(mockUserSkillData);

      const result = await controller.getUserSkillInfo(mockRequest as any);

      expect(mockStatsService.getUserSkillInfo).toHaveBeenCalledWith('user123');
      expect(result).toEqual(mockUserSkillData);
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Processing stats request for user: user123',
      );
    });

    it('should throw HttpException when service throws an error', async () => {
      const mockRequest = { user: { id: 'user123' } };
      const mockError = new Error('Service error');

      mockStatsService.getUserSkillInfo.mockRejectedValue(mockError);

      await expect(
        controller.getUserSkillInfo(mockRequest as any),
      ).rejects.toThrow(HttpException);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getJobPostInfo', () => {
    it('should return job post info when successful', async () => {
      const mockJobPostData = {
        skills: { JavaScript: 'required', TypeScript: 'preferred' },
      };
      const jobId = 'job123';

      mockStatsService.getJobPostInfo.mockResolvedValue(mockJobPostData);

      const result = await controller.getJobPostInfo(jobId);

      expect(mockStatsService.getJobPostInfo).toHaveBeenCalledWith(jobId);
      expect(result).toEqual(mockJobPostData);
    });
  });
});
