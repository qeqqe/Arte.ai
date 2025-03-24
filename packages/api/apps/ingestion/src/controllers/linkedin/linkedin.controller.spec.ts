import { Test, TestingModule } from '@nestjs/testing';
import { LinkedinController } from './linkedin.controller';
import { LinkedinService } from '../../services/linkedin/linkedin.service';

describe('LinkedinController', () => {
  let controller: LinkedinController;
  let linkedinService: LinkedinService;

  beforeEach(async () => {
    const mockLinkedinService = {
      scrapeJob: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinkedinController],
      providers: [
        {
          provide: LinkedinService,
          useValue: mockLinkedinService,
        },
      ],
    }).compile();

    controller = module.get<LinkedinController>(LinkedinController);
    linkedinService = module.get<LinkedinService>(LinkedinService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
