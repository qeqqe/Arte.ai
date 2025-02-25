import { Test, TestingModule } from '@nestjs/testing';
import { LinkedinService } from './linkedin.service';

describe('LinkedinService', () => {
  let service: LinkedinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LinkedinService],
    }).compile();

    service = module.get<LinkedinService>(LinkedinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
