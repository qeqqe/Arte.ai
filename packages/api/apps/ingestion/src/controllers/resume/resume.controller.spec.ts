import { Test, TestingModule } from '@nestjs/testing';
import { ResumeController } from './resume.controller';
import { ResumeService } from '../../services/resume/resume.service';
import { JwtAuthGuard } from '@app/common/auth';
import { Logger } from '@nestjs/common';

describe('ResumeController', () => {
  let controller: ResumeController;

  const mockResumeService = {
    handleFileUpload: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResumeController],
      providers: [
        {
          provide: ResumeService,
          useValue: mockResumeService,
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ResumeController>(ResumeController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should call resumeService.handleFileUpload with correct parameters', async () => {
      const mockFile = {
        originalname: 'resume.pdf',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;
      const mockRequest = { user: { id: 'user123' } };
      mockResumeService.handleFileUpload.mockResolvedValue({
        text: 'resume content',
      });

      const result = await controller.uploadFile(mockFile, mockRequest as any);

      expect(mockResumeService.handleFileUpload).toHaveBeenCalledWith(
        mockFile,
        'user123',
      );
      expect(result).toEqual({ text: 'resume content' });
    });
  });
});
